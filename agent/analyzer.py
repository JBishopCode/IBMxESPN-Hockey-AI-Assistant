"""
agent/analyzer.py
Core analysis functions — startup report, free agents,
matchup analysis, trade evaluation.
"""

from watsonx.client import WatsonxClient
from watsonx import prompts
from espn.roster import format_full_roster, split_roster
from espn.free_agents import (
    fetch_free_agents,
    format_free_agents_for_prompt,
    get_hot_free_agents,
    get_rising_free_agents,
)
from espn.matchups import (
    get_my_matchup,
    get_matchup_summary,
    format_matchup_for_prompt,
    format_schedule_context,
)


class IceIntelligence:
    def __init__(self, league, team, manager_name: str, watsonx: WatsonxClient):
        self.league = league
        self.team = team
        self.manager = manager_name
        self.watsonx = watsonx

        # Cache data so we don't re-fetch every call
        self._roster_players = None
        self._roster_text = None
        self._free_agents = None
        self._matchup_summary = None
        self._matchup_text = None
        self._schedule_text = None
        self._week = league.currentMatchupPeriod
        self._league_name = league.settings.name

    def load_data(self, roster_players: list[dict]):
        """Load and cache all data needed for analysis."""
        self._roster_players = roster_players
        self._roster_text = format_full_roster(roster_players)
        self._schedule_text = format_schedule_context(roster_players)

        print("  Loading free agents...")
        self._free_agents = fetch_free_agents(self.league)
        self._fa_text = format_free_agents_for_prompt(self._free_agents)

        print("  Loading matchup data...")
        box = get_my_matchup(self.league, self.team)
        self._matchup_summary = get_matchup_summary(box, self.team)
        self._matchup_text = format_matchup_for_prompt(self._matchup_summary, self._week)

    def _record(self) -> str:
        return f"{self.team.wins}-{self.team.losses}"

    def _build_context(self) -> str:
        return prompts.build_context_block(
            manager=self.manager,
            team_name=self.team.team_name,
            record=self._record(),
            week=self._week,
            league_name=self._league_name,
            roster_text=self._roster_text,
            matchup_text=self._matchup_text,
            schedule_text=self._schedule_text,
            fa_text=self._fa_text,
        )

    def run_startup_analysis(self) -> str:
        """Full automatic roster analysis run on startup."""
        context = self._build_context()
        prompt = prompts.startup_analysis_prompt(context)
        return self.watsonx.generate(prompt, max_tokens=1500)

    def run_free_agent_analysis(self) -> str:
        """Deep free agent pickup and drop recommendations."""
        context = self._build_context()
        prompt = prompts.free_agent_prompt(context)
        return self.watsonx.generate(prompt, max_tokens=1500)

    def run_matchup_analysis(self) -> str:
        """Current week matchup breakdown and strategy."""
        context = self._build_context()
        prompt = prompts.matchup_analysis_prompt(context)
        return self.watsonx.generate(prompt, max_tokens=1200)

    def run_trade_analysis(self, trade_description: str) -> str:
        """Evaluate a proposed trade."""
        context = self._build_context()
        prompt = prompts.trade_analysis_prompt(context, trade_description)
        return self.watsonx.generate(prompt, max_tokens=1200)

    def answer_question(self, question: str) -> str:
        """Answer a free-form fantasy hockey question."""
        context = self._build_context()
        prompt = prompts.chat_prompt(context, question)
        return self.watsonx.generate(prompt, max_tokens=1200)

    def get_hot_wire(self) -> str:
        """Return a formatted hot waiver wire list."""
        hot = get_hot_free_agents(self._free_agents, top_n=10)
        rising = get_rising_free_agents(self._free_agents, top_n=5)

        lines = ["=== HOT WAIVER WIRE — TOP 10 ==="]
        for i, fa in enumerate(hot, 1):
            s = fa["stats"]
            lines.append(
                f"{i}. {fa['name']} ({fa['position']}, {fa['pro_team']}) | "
                f"L7: {s['l7_g']}G {s['l7_a']}A | "
                f"L15: {s['l15_g']}G {s['l15_a']}A | "
                f"Season: {s['pts']}PTS in {s['gp']}GP"
            )

        lines.append("\n=== PLAYERS ON THE RISE ===")
        for fa in rising:
            s = fa["stats"]
            lines.append(
                f"  {fa['name']} ({fa['position']}, {fa['pro_team']}) | "
                f"Season avg: {round(s['pts']/max(s['gp'],1),2)} PPG → "
                f"Last 30 avg: {round(s['l30_pts']/max(s['l30_gp'],1),2)} PPG ↑"
            )

        return "\n".join(lines)
