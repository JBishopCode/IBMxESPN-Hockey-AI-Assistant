"""
agent/chat.py
Interactive chat loop with command routing and session logging.
"""

import os
import datetime
from agent.analyzer import IceIntelligence
from espn.roster import format_full_roster
import config


HELP_TEXT = """
=== ICE INTELLIGENCE COMMANDS ===

  [any question]     Ask anything about your fantasy hockey team
  roster             Show your full roster with stats
  free agents        Full free agent pickup/drop analysis
  matchup            Current week matchup breakdown
  hot wire           Top 10 waiver wire pickups right now
  trade [details]    Analyze a proposed trade
                     Example: trade Nazem Kadri for Seth Jarvis
  help               Show this help menu
  quit               Exit Ice Intelligence
"""

DIVIDER = "-" * 60


def run_chat(agent: IceIntelligence, roster_players: list, log_path: str = None):
    """Main interactive chat loop."""
    log_lines = []

    def log(text: str):
        """Print and optionally log a line."""
        print(text)
        if log_path:
            log_lines.append(text)

    def save_log():
        if log_path and log_lines:
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            with open(log_path, "w", encoding="utf-8") as f:
                f.write("\n".join(log_lines))
            print(f"\nSession saved to {log_path}")

    log(HELP_TEXT)
    log(DIVIDER)

    while True:
        try:
            raw = input("\nYou: ").strip()
        except (KeyboardInterrupt, EOFError):
            log("\nExiting...")
            save_log()
            break

        if not raw:
            continue

        cmd = raw.lower()
        log(f"\nYou: {raw}")

        # Exit
        if cmd in ("quit", "exit", "q"):
            log("Good luck this week!")
            save_log()
            break

        # Help
        elif cmd == "help":
            log(HELP_TEXT)

        # Roster display
        elif cmd == "roster":
            log("\n" + format_full_roster(roster_players))

        # Free agent analysis
        elif cmd in ("free agents", "free agent", "fa", "waivers"):
            log("\nRunning free agent analysis...")
            response = agent.run_free_agent_analysis()
            log(f"\nIce Intelligence:\n{response}")
            log(DIVIDER)

        # Hot waiver wire
        elif cmd in ("hot wire", "hotwire", "hot waiver", "wire"):
            log("\n" + agent.get_hot_wire())

        # Matchup analysis
        elif cmd in ("matchup", "match", "score", "this week"):
            log("\nAnalyzing current matchup...")
            response = agent.run_matchup_analysis()
            log(f"\nIce Intelligence:\n{response}")
            log(DIVIDER)

        # Trade analysis
        elif cmd.startswith("trade "):
            trade_details = raw[6:].strip()
            if not trade_details:
                log("Please describe the trade. Example: trade Nazem Kadri for Seth Jarvis")
            else:
                log(f"\nAnalyzing trade: {trade_details}...")
                response = agent.run_trade_analysis(trade_details)
                log(f"\nIce Intelligence:\n{response}")
                log(DIVIDER)

        # General question — send to watsonx
        else:
            log("\nIce Intelligence is thinking...\n")
            response = agent.answer_question(raw)
            log(f"Ice Intelligence:\n{response}")
            log(DIVIDER)


def get_log_path() -> str:
    """Generate a timestamped log file path."""
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    return os.path.join(config.SESSION_LOG_DIR, f"session_{ts}.txt")
