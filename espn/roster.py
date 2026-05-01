"""
espn/roster.py
Parses roster data and extracts rich stats for each player.
"""


def get_player_stats(player) -> dict:
    """Extract all useful stats from a player object."""
    stats = player.stats

    season = stats.get("Total 2026", {}).get("total", {})
    last7 = stats.get("Last 7 2026", {}).get("total", {})
    last15 = stats.get("Last 15 2026", {}).get("total", {})
    last30 = stats.get("Last 30 2026", {}).get("total", {})
    projected = stats.get("Projected 2026", {}).get("total", {})

    def i(val):
        return int(val) if val else 0

    def f(val):
        return round(float(val), 1) if val else 0.0

    return {
        # Season totals
        "gp": i(season.get("GP")),
        "g": i(season.get("G")),
        "a": i(season.get("A")),
        "pts": i(season.get("G", 0)) + i(season.get("A", 0)),
        "plus_minus": i(season.get("+/-")),
        "pim": i(season.get("PIM")),
        "ppg": i(season.get("PPG")),
        "ppa": i(season.get("PPA")),
        "ppp": i(season.get("PPP")),
        "shg": i(season.get("SHG")),
        "sog": i(season.get("SOG")),
        "hits": i(season.get("HIT")),
        "blk": i(season.get("BLK")),
        "gw": i(season.get("GWG")),
        "atoi": f(season.get("ATOI")),

        # Last 7 days
        "l7_g": i(last7.get("G")),
        "l7_a": i(last7.get("A")),
        "l7_pts": i(last7.get("G", 0)) + i(last7.get("A", 0)),
        "l7_gp": i(last7.get("GP")),

        # Last 15 days
        "l15_g": i(last15.get("G")),
        "l15_a": i(last15.get("A")),
        "l15_pts": i(last15.get("G", 0)) + i(last15.get("A", 0)),
        "l15_gp": i(last15.get("GP")),

        # Last 30 days
        "l30_g": i(last30.get("G")),
        "l30_a": i(last30.get("A")),
        "l30_pts": i(last30.get("G", 0)) + i(last30.get("A", 0)),
        "l30_gp": i(last30.get("GP")),

        # Projections
        "proj_g": i(projected.get("G")),
        "proj_a": i(projected.get("A")),
        "proj_pts": i(projected.get("G", 0)) + i(projected.get("A", 0)),
        "proj_gp": i(projected.get("GP")),
    }


def parse_roster(team) -> list[dict]:
    """
    Parse all players on a team roster into structured dicts.
    Includes injury status, position, team, and all stats.
    """
    players = []
    for player in team.roster:
        s = get_player_stats(player)
        players.append({
            "name": player.name,
            "position": player.position,
            "lineup_slot": player.lineupSlot,
            "eligible_slots": player.eligibleSlots,
            "pro_team": player.proTeam,
            "injured": player.injured,
            "injury_status": player.injuryStatus,
            "stats": s,
        })
    return players


def split_roster(players: list[dict]) -> tuple[list, list, list]:
    """Split roster into healthy, injured, and IR players."""
    healthy = []
    injured = []
    ir = []
    for p in players:
        if "IR" in p.get("lineup_slot", ""):
            ir.append(p)
        elif p["injured"]:
            injured.append(p)
        else:
            healthy.append(p)
    return healthy, injured, ir


def hot_streak_score(player: dict) -> float:
    """
    Score a player's recent form.
    Higher = hotter. Used for sorting hot/cold lists.
    """
    s = player["stats"]
    if s["gp"] == 0:
        return 0.0
    # Weight recent games more heavily
    score = (s["l7_pts"] * 3) + (s["l15_pts"] * 2) + s["l30_pts"]
    return score


def format_player_line(player: dict) -> str:
    """Format a single player as a readable stat line."""
    s = player["stats"]
    status = f"[{player['injury_status']}]" if player["injured"] else "[ACTIVE]"
    return (
        f"{player['name']} | {player['position']} | {player['pro_team']} | {status}\n"
        f"  Season: {s['g']}G {s['a']}A {s['pts']}PTS "
        f"+/-:{s['plus_minus']} PPG:{s['ppg']} SOG:{s['sog']} "
        f"HIT:{s['hits']} BLK:{s['blk']} GP:{s['gp']}\n"
        f"  Last 7:  {s['l7_g']}G {s['l7_a']}A ({s['l7_gp']} GP) | "
        f"Last 15: {s['l15_g']}G {s['l15_a']}A ({s['l15_gp']} GP) | "
        f"Last 30: {s['l30_g']}G {s['l30_a']}A ({s['l30_gp']} GP)\n"
        f"  Projected: {s['proj_g']}G {s['proj_a']}A {s['proj_pts']}PTS over {s['proj_gp']} GP"
    )


def format_full_roster(players: list[dict]) -> str:
    """Format the full roster as a prompt-ready string."""
    healthy, injured, ir = split_roster(players)
    lines = []

    lines.append("=== HEALTHY PLAYERS ===")
    for p in healthy:
        lines.append(format_player_line(p))

    if injured:
        lines.append("\n=== INJURED PLAYERS ===")
        for p in injured:
            lines.append(format_player_line(p))

    if ir:
        lines.append("\n=== INJURED RESERVE ===")
        for p in ir:
            lines.append(format_player_line(p))

    return "\n".join(lines)
