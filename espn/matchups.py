"""
espn/matchups.py
Fetches current week matchup data including scores,
opponent roster, and weekly game counts per NHL team.
"""

from espn_api.hockey import League


# Approximate games remaining this week per NHL team.
# This is updated manually or can be pulled via NHL API in a future version.
# Values represent games scheduled in the current fantasy week.
NHL_WEEKLY_GAMES = {
    "Anaheim Ducks": 3,
    "Arizona Coyotes": 0,
    "Boston Bruins": 2,
    "Buffalo Sabres": 3,
    "Calgary Flames": 3,
    "Carolina Hurricanes": 2,
    "Chicago Blackhawks": 3,
    "Colorado Avalanche": 2,
    "Columbus Blue Jackets": 3,
    "Dallas Stars": 2,
    "Detroit Red Wings": 3,
    "Edmonton Oilers": 2,
    "Florida Panthers": 3,
    "Los Angeles Kings": 2,
    "Minnesota Wild": 2,
    "Montréal Canadiens": 3,
    "Nashville Predators": 3,
    "New Jersey Devils": 2,
    "New York Islanders": 3,
    "New York Rangers": 2,
    "Ottawa Senators": 3,
    "Philadelphia Flyers": 2,
    "Pittsburgh Penguins": 3,
    "San Jose Sharks": 3,
    "Seattle Kraken": 2,
    "St. Louis Blues": 3,
    "Tampa Bay Lightning": 2,
    "Toronto Maple Leafs": 3,
    "Utah Hockey Club": 2,
    "Vancouver Canucks": 2,
    "Vegas Golden Knights": 3,
    "Washington Capitals": 2,
    "Winnipeg Jets": 3,
}


def get_my_matchup(league: League, my_team):
    """Find and return the current week matchup involving my team."""
    try:
        box_scores = league.box_scores()
        for box in box_scores:
            if (hasattr(box, "home_team") and box.home_team == my_team) or \
               (hasattr(box, "away_team") and box.away_team == my_team):
                return box
    except Exception:
        pass
    return None


def get_matchup_summary(box, my_team) -> dict:
    """
    Parse a box score into a structured matchup summary.
    Returns my score, opponent score, and both lineups.
    """
    if box is None:
        return None

    if box.home_team == my_team:
        my_score = box.home_score
        opp_score = box.away_score
        opponent = box.away_team
        my_lineup = box.home_lineup
        opp_lineup = box.away_lineup
        winning = my_score > opp_score
    else:
        my_score = box.away_score
        opp_score = box.home_score
        opponent = box.home_team
        my_lineup = box.away_lineup
        opp_lineup = box.home_lineup
        winning = my_score > opp_score

    return {
        "my_score": round(my_score, 1),
        "opp_score": round(opp_score, 1),
        "opponent_name": opponent.team_name,
        "winning": winning,
        "lead": round(abs(my_score - opp_score), 1),
        "my_lineup": my_lineup,
        "opp_lineup": opp_lineup,
    }


def get_games_this_week(pro_team: str) -> int:
    """Return estimated games this week for a given NHL team."""
    return NHL_WEEKLY_GAMES.get(pro_team, 2)


def format_matchup_for_prompt(summary: dict, week: int) -> str:
    """Format matchup data as a prompt-ready string."""
    if not summary:
        return "No current matchup data available."

    status = "WINNING" if summary["winning"] else "LOSING"
    lines = [
        f"=== CURRENT WEEK {week} MATCHUP ===",
        f"My Score: {summary['my_score']} vs {summary['opponent_name']}: {summary['opp_score']}",
        f"Status: {status} by {summary['lead']} points",
        "",
        "My Active Lineup (points scored this week):",
    ]

    for player in summary["my_lineup"]:
        lines.append(f"  {player.name}: {player.points} pts")

    lines.append(f"\nOpponent ({summary['opponent_name']}) Active Lineup:")
    for player in summary["opp_lineup"]:
        lines.append(f"  {player.name}: {player.points} pts")

    return "\n".join(lines)


def format_schedule_context(players: list[dict]) -> str:
    """
    Add weekly game count context to each player.
    Helps the AI recommend players with more games this week.
    """
    lines = ["=== WEEKLY GAME COUNTS FOR YOUR PLAYERS ==="]
    sorted_players = sorted(
        players,
        key=lambda p: get_games_this_week(p["pro_team"]),
        reverse=True
    )
    for p in sorted_players:
        games = get_games_this_week(p["pro_team"])
        status = "✓ START" if games >= 3 else ("→ MONITOR" if games == 2 else "✗ RISKY")
        lines.append(
            f"  {p['name']} ({p['pro_team']}): {games} games this week {status}"
        )
    return "\n".join(lines)
