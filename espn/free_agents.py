"""
espn/free_agents.py
Fetches and analyzes free agents from the ESPN league.
"""

from espn_api.hockey import League
from espn.roster import get_player_stats, hot_streak_score
import config


def fetch_free_agents(league: League, size: int = None) -> list[dict]:
    """Fetch available free agents and parse their stats."""
    fetch_size = size or config.FREE_AGENT_FETCH_SIZE
    raw = league.free_agents(size=fetch_size)

    agents = []
    for player in raw:
        s = get_player_stats(player)
        score = _fa_score(s)
        agents.append({
            "name": player.name,
            "position": player.position,
            "pro_team": player.proTeam,
            "injured": player.injured,
            "injury_status": player.injuryStatus,
            "stats": s,
            "fa_score": score,
        })

    # Sort by overall value score descending
    agents.sort(key=lambda x: x["fa_score"], reverse=True)
    return agents


def _fa_score(s: dict) -> float:
    """
    Score a free agent's overall value.
    Balances season production, recent form, and projections.
    """
    if s["gp"] == 0:
        return 0.0
    season_pts_per_gp = s["pts"] / max(s["gp"], 1)
    recent_score = (s["l7_pts"] * 3) + (s["l15_pts"] * 2) + s["l30_pts"]
    proj_value = s["proj_pts"] * 0.5
    return round((season_pts_per_gp * 10) + recent_score + proj_value, 2)


def get_hot_free_agents(agents: list[dict], top_n: int = 10) -> list[dict]:
    """Return top N free agents sorted by recent hot streak."""
    scored = sorted(agents, key=lambda x: (
        (x["stats"]["l7_pts"] * 3) +
        (x["stats"]["l15_pts"] * 2) +
        x["stats"]["l30_pts"]
    ), reverse=True)
    return scored[:top_n]


def get_rising_free_agents(agents: list[dict], top_n: int = 10) -> list[dict]:
    """
    Return players who are outperforming their season average recently.
    These are the 'on the rise' players worth watching.
    """
    rising = []
    for fa in agents:
        s = fa["stats"]
        if s["gp"] < 10 or s["l30_gp"] < 5:
            continue
        season_ppg = s["pts"] / max(s["gp"], 1)
        recent_ppg = s["l30_pts"] / max(s["l30_gp"], 1)
        if recent_ppg > season_ppg * 1.2:  # 20% above season average
            fa["rise_delta"] = round(recent_ppg - season_ppg, 2)
            rising.append(fa)

    rising.sort(key=lambda x: x.get("rise_delta", 0), reverse=True)
    return rising[:top_n]


def format_free_agents_for_prompt(agents: list[dict], limit: int = 15) -> str:
    """Format top free agents as a prompt-ready string."""
    lines = ["=== TOP AVAILABLE FREE AGENTS ==="]
    for fa in agents[:limit]:
        s = fa["stats"]
        status = f"[{fa['injury_status']}]" if fa["injured"] else "[ACTIVE]"
        lines.append(
            f"{fa['name']} | {fa['position']} | {fa['pro_team']} | {status}\n"
            f"  Season: {s['g']}G {s['a']}A {s['pts']}PTS PPG:{s['ppg']} GP:{s['gp']}\n"
            f"  Last 7: {s['l7_g']}G {s['l7_a']}A ({s['l7_gp']} GP) | "
            f"Last 30: {s['l30_g']}G {s['l30_a']}A ({s['l30_gp']} GP)\n"
            f"  Projected: {s['proj_g']}G {s['proj_a']}A {s['proj_pts']}PTS"
        )
    return "\n".join(lines)
