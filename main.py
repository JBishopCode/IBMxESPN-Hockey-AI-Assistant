"""
main.py
Ice Intelligence — ESPN Fantasy Hockey AI Agent
Powered by IBM watsonx

Entry point. Run with: python main.py
"""

import sys
from espn.league import connect, get_team_by_manager, get_league_info, MANAGER_INDEX_MAP
from espn.roster import parse_roster
from watsonx.client import WatsonxClient
from agent.analyzer import IceIntelligence
from agent.chat import run_chat, get_log_path
from utils.formatter import (
    print_header,
    print_team_banner,
    print_loading,
    print_success,
    print_error,
    prompt_manager_name,
    DIVIDER,
)


def main():
    print_header("ICE INTELLIGENCE — Starting up")

    # ── Step 1: Connect to ESPN ──────────────────────────────
    print_loading("Connecting to ESPN Fantasy Hockey")
    try:
        league = connect()
        info = get_league_info(league)
        print_success(f"Connected to: {info['name']}")
        print_success(f"Season week: {info['current_week']} | Teams: {info['total_teams']}")
    except Exception as e:
        print_error(f"ESPN connection failed: {e}")
        sys.exit(1)

    # ── Step 2: Select manager ───────────────────────────────
    known = list(MANAGER_INDEX_MAP.keys())
    manager_name = prompt_manager_name(known)

    team = get_team_by_manager(league, manager_name)
    if team is None:
        print_error(f"Manager '{manager_name}' not found. Check the name and try again.")
        sys.exit(1)

    print_success(f"Team found: {team.team_name} ({team.wins}-{team.losses})")

    # ── Step 3: Connect to watsonx ───────────────────────────
    print_loading("Connecting to IBM watsonx")
    watsonx = WatsonxClient()
    if not watsonx.test_connection():
        print_error("watsonx connection failed. Check your API key and project ID.")
        sys.exit(1)
    print_success("watsonx connected")

    # ── Step 4: Load roster ──────────────────────────────────
    print_loading("Loading roster")
    try:
        roster_players = parse_roster(team)
        print_success(f"Roster loaded: {len(roster_players)} players")
    except Exception as e:
        print_error(f"Roster load failed: {e}")
        sys.exit(1)

    # ── Step 5: Build agent and load all data ─────────────────
    agent = IceIntelligence(
        league=league,
        team=team,
        manager_name=manager_name.title(),
        watsonx=watsonx,
    )

    print_loading("Loading free agents, matchups, and schedule data")
    try:
        agent.load_data(roster_players)
        print_success("All data loaded")
    except Exception as e:
        print_error(f"Data load error: {e}")
        sys.exit(1)

    # ── Step 6: Print banner ─────────────────────────────────
    print_team_banner(
        team_name=team.team_name,
        manager=manager_name.title(),
        record=f"{team.wins}-{team.losses}",
        week=league.currentMatchupPeriod,
        league=league.settings.name,
    )

    # ── Step 7: Run startup analysis ─────────────────────────
    print(f"\n{DIVIDER}")
    print("  AUTOMATIC ROSTER ANALYSIS")
    print(DIVIDER)
    print("\nAnalyzing your roster...\n")

    try:
        analysis = agent.run_startup_analysis()
        print(analysis)
    except Exception as e:
        print_error(f"Startup analysis failed: {e}")

    # ── Step 8: Start chat loop ───────────────────────────────
    log_path = get_log_path()
    run_chat(agent, roster_players, log_path=log_path)


if __name__ == "__main__":
    main()
