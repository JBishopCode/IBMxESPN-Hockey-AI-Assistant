"""
watsonx/prompts.py
All prompt templates used by the Ice Intelligence agent.
Centralizing prompts here makes them easy to tune and version.
"""


SYSTEM_HEADER = """You are Ice Intelligence, an expert ESPN Fantasy Hockey AI analyst.
You help fantasy hockey managers make smart, data-driven decisions.
You have access to real roster data, free agent stats, matchup scores, and weekly schedules.
Always reference specific player names and stats in your reasoning.
Be direct, specific, and actionable.

STATS KEY:
G=Goals, A=Assists, PTS=Points, +/-=Plus Minus, PIM=Penalty Minutes,
PPG=Power Play Goals, PPA=Power Play Assists, PPP=Power Play Points,
SOG=Shots on Goal, HIT=Hits, BLK=Blocks, GP=Games Played,
L7/L15/L30 = stats over last 7/15/30 days, Proj = full season projection
"""


def build_context_block(
    manager: str,
    team_name: str,
    record: str,
    week: int,
    league_name: str,
    roster_text: str,
    matchup_text: str = "",
    schedule_text: str = "",
    fa_text: str = "",
) -> str:
    """Build the shared context block used in all prompts."""
    parts = [
        SYSTEM_HEADER,
        f"MANAGER: {manager}",
        f"TEAM: {team_name}",
        f"RECORD: {record}",
        f"LEAGUE: {league_name} | Week {week}",
        "",
        roster_text,
    ]
    if matchup_text:
        parts += ["", matchup_text]
    if schedule_text:
        parts += ["", schedule_text]
    if fa_text:
        parts += ["", fa_text]
    return "\n".join(parts)


def startup_analysis_prompt(context: str) -> str:
    return f"""{context}

Please provide a complete automatic roster analysis:

1. INJURY REPORT
   List all injured players, their injury status, and impact on your roster depth.

2. HOT PLAYERS (last 7 and 15 days)
   Who is on a hot streak right now? Reference specific recent stats.

3. COLD PLAYERS
   Who is underperforming recently compared to their season average?

4. WEEKLY SCHEDULE ADVANTAGE
   Which of your players have the most games this week? Who should you prioritize?

5. CURRENT MATCHUP STATUS
   Are you winning or losing this week? What is driving the score?

6. QUICK ACTION SUMMARY
   - DROP: [player name] — one sentence reason
   - PICKUP: [player name] — one sentence reason
   - WATCH: [2-3 players to monitor this week]

Ice Intelligence Analysis:"""


def free_agent_prompt(context: str) -> str:
    return f"""{context}

Analyze the available free agents and provide pickup recommendations.

1. TOP PICKUPS BY POSITION
   Recommend the best available player at each position that fills a need on this roster.
   Reference their stats and explain why they are worth adding.

2. HOT WIRE PICKUPS
   Which free agents are on fire right now based on last 7 and 15 days?

3. PLAYERS ON THE RISE
   Which free agents are outperforming their season average recently and could be breakout adds?

4. DROP CANDIDATES
   Which players on the current roster should be dropped to make room?
   Be specific about who to drop and why.

5. QUICK SUMMARY
   - MUST ADD: [name] for [dropped player]
   - CONSIDER: [name] if [condition]
   - WATCH LIST: [1-2 names to monitor on waivers]

Ice Intelligence Free Agent Report:"""


def matchup_analysis_prompt(context: str) -> str:
    return f"""{context}

Analyze this week's matchup in detail.

1. CURRENT STANDING
   Score breakdown and trajectory. Are you on pace to win?

2. CATEGORY BREAKDOWN
   Where are you winning and losing vs your opponent this week?
   Reference specific players driving each side.

3. REMAINING GAMES
   Which of your players still have games left this week?
   Who has the most upside remaining?

4. OPPONENT THREATS
   Who on your opponent's roster is putting up the most points?
   Any players you need to watch closely?

5. WEEK STRATEGY
   What should you do right now to maximize your chances of winning?

Ice Intelligence Matchup Report:"""


def trade_analysis_prompt(context: str, trade_description: str) -> str:
    return f"""{context}

PROPOSED TRADE: {trade_description}

Analyze this trade from Jordan's perspective.

1. WHAT YOU ARE GIVING UP
   Evaluate the players leaving your roster. What do you lose in production,
   categories covered, and future value?

2. WHAT YOU ARE GETTING
   Evaluate the players coming in. What do you gain?
   How do they fit your current roster needs?

3. CATEGORY IMPACT
   How does this trade affect your weekly scoring categories?
   Does it address a weakness or create a new one?

4. SEASON CONTEXT
   It is currently week {context[:10]}. How does timing affect this trade's value?
   Are you in a position to win now or rebuilding?

5. VERDICT
   ACCEPT or REJECT — with a clear one paragraph explanation.

Ice Intelligence Trade Analysis:"""


def chat_prompt(context: str, question: str) -> str:
    return f"""{context}

USER QUESTION: {question}

Provide a detailed, specific, data-driven answer. Reference actual player stats.
Be direct and actionable.

Ice Intelligence:"""
