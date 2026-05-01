"""
utils/formatter.py
Terminal display helpers for clean formatted output.
"""

DIVIDER = "=" * 60
THIN = "-" * 60


def print_header(title: str):
    print(f"\n{DIVIDER}")
    print(f"  {title}")
    print(DIVIDER)


def print_section(title: str):
    print(f"\n{THIN}")
    print(f"  {title}")
    print(THIN)


def print_team_banner(team_name: str, manager: str, record: str, week: int, league: str):
    print(DIVIDER)
    print(f"  ICE INTELLIGENCE — ESPN Fantasy Hockey AI")
    print(f"  Powered by IBM watsonx")
    print(THIN)
    print(f"  Manager : {manager}")
    print(f"  Team    : {team_name}")
    print(f"  Record  : {record}")
    print(f"  League  : {league}")
    print(f"  Week    : {week}")
    print(DIVIDER)


def print_loading(message: str):
    print(f"  → {message}...")


def print_success(message: str):
    print(f"  ✓ {message}")


def print_error(message: str):
    print(f"  ✗ ERROR: {message}")


def prompt_manager_name(known_managers: list[str]) -> str:
    """Ask user to enter a manager name and validate it."""
    print("\nKnown managers:")
    for name in known_managers:
        print(f"  - {name}")
    print()
    name = input("Enter manager name: ").strip()
    return name
