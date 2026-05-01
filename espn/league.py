"""
espn/league.py
Handles ESPN league connection and team lookup by manager name.
"""

from espn_api.hockey import League
import config

MANAGER_INDEX_MAP = {
    "kenley young": 0,
    "reece smith": 1,
    "robert mccarthy": 2,
    "greg smith": 3,
    "landon keating": 4,
    "ben taylor": 5,
    "sam bishop": 6,
    "matthew kavanagh": 7,
    "jordan bishop": 8,
    "daniel white": 9,
}


def connect() -> League:
    league = League(
        league_id=config.ESPN_LEAGUE_ID,
        year=config.ESPN_YEAR,
        espn_s2=config.ESPN_S2,
        swid=config.ESPN_SWID
    )
    return league


def get_all_managers(league: League) -> list[dict]:
    index_to_manager = {v: k.title() for k, v in MANAGER_INDEX_MAP.items()}
    teams = []
    for i, team in enumerate(league.teams):
        manager = index_to_manager.get(i, f"Unknown (Team {i})")
        teams.append({
            "index": i,
            "team_name": team.team_name.strip(),
            "manager": manager,
            "wins": team.wins,
            "losses": team.losses,
        })
    return teams


def get_team_by_manager(league: League, manager_name: str):
    key = manager_name.strip().lower()

    if key in MANAGER_INDEX_MAP:
        index = MANAGER_INDEX_MAP[key]
        return league.teams[index]

    for team in league.teams:
        if key in team.team_name.strip().lower():
            return team

    if key.isdigit():
        index = int(key)
        if 0 <= index < len(league.teams):
            return league.teams[index]

    return None


def get_league_info(league: League) -> dict:
    return {
        "name": league.settings.name,
        "year": league.year,
        "current_week": league.currentMatchupPeriod,
        "scoring_period": league.scoringPeriodId,
        "total_teams": len(league.teams),
    }