"""
api_server.py
FastAPI backend for Ice Intelligence web UI.
Sits at the project root alongside espn/, watsonx/, agent/ etc.

Run with: uvicorn api_server:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from espn.league import connect, get_team_by_manager, get_all_managers, get_league_info
from espn.roster import parse_roster
from espn.free_agents import fetch_free_agents, get_rising_free_agents
from espn.matchups import get_my_matchup, get_matchup_summary, get_games_this_week
from watsonx.client import WatsonxClient
from agent.analyzer import IceIntelligence

app = FastAPI(title="Ice Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache connections so we don't reconnect on every request
_league = None
_watsonx = None


def get_league():
    global _league
    if _league is None:
        _league = connect()
    return _league


def get_watsonx():
    global _watsonx
    if _watsonx is None:
        _watsonx = WatsonxClient()
    return _watsonx


class ManagerRequest(BaseModel):
    manager: str


class ChatRequest(BaseModel):
    manager: str
    question: str
    mode: str = "chat"


@app.get("/health")
def health():
    return {"status": "ok", "service": "Ice Intelligence API"}


@app.get("/managers")
def list_managers():
    try:
        league = get_league()
        teams = get_all_managers(league)
        return {"teams": teams}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/roster")
def get_roster(req: ManagerRequest):
    try:
        league = get_league()
        team = get_team_by_manager(league, req.manager)
        if not team:
            raise HTTPException(status_code=404, detail=f"Manager '{req.manager}' not found")

        players_raw = parse_roster(team)
        for p in players_raw:
            p["games_this_week"] = get_games_this_week(p["pro_team"])

        info = get_league_info(league)
        team_info = {
            "team_name": team.team_name.strip(),
            "manager": req.manager,
            "record": f"{team.wins}-{team.losses}",
            "wins": team.wins,
            "losses": team.losses,
            "week": info["current_week"],
            "league_name": info["name"],
        }
        return {"players": players_raw, "team_info": team_info}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze")
def analyze_roster(req: ManagerRequest):
    try:
        league = get_league()
        team = get_team_by_manager(league, req.manager)
        if not team:
            raise HTTPException(status_code=404, detail=f"Manager '{req.manager}' not found")

        watsonx = get_watsonx()
        roster_players = parse_roster(team)

        agent = IceIntelligence(
            league=league,
            team=team,
            manager_name=req.manager.title(),
            watsonx=watsonx,
        )
        agent.load_data(roster_players)
        analysis = agent.run_startup_analysis()
        return {"analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/freeagents")
def get_free_agents(req: ManagerRequest):
    try:
        league = get_league()
        agents_raw = fetch_free_agents(league)
        rising = get_rising_free_agents(agents_raw)
        rising_names = {fa["name"]: fa.get("rise_delta", 0) for fa in rising}
        for fa in agents_raw:
            if fa["name"] in rising_names:
                fa["rise_delta"] = rising_names[fa["name"]]
        return {"free_agents": agents_raw}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/matchup")
def get_matchup(req: ManagerRequest):
    try:
        league = get_league()
        team = get_team_by_manager(league, req.manager)
        if not team:
            raise HTTPException(status_code=404, detail=f"Manager '{req.manager}' not found")

        box = get_my_matchup(league, team)
        summary = get_matchup_summary(box, team)

        if summary:
            return {"matchup": {
                "my_score": summary["my_score"],
                "opp_score": summary["opp_score"],
                "opponent_name": summary["opponent_name"],
                "winning": summary["winning"],
                "lead": summary["lead"],
            }}
        return {"matchup": None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat(req: ChatRequest):
    try:
        league = get_league()
        team = get_team_by_manager(league, req.manager)
        if not team:
            raise HTTPException(status_code=404, detail=f"Manager '{req.manager}' not found")

        watsonx = get_watsonx()
        roster_players = parse_roster(team)

        agent = IceIntelligence(
            league=league,
            team=team,
            manager_name=req.manager.title(),
            watsonx=watsonx,
        )
        agent.load_data(roster_players)

        q = req.question.lower().strip()
        if q in ("free agents", "free agent", "fa", "waivers"):
            response = agent.run_free_agent_analysis()
        elif q in ("matchup", "match", "score", "this week"):
            response = agent.run_matchup_analysis()
        elif q in ("hot wire", "hotwire", "hot waiver", "wire"):
            response = agent.get_hot_wire()
        elif q.startswith("trade "):
            response = agent.run_trade_analysis(req.question[6:].strip())
        else:
            response = agent.answer_question(req.question)

        return {"response": response}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
