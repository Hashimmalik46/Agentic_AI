"""
push_to_db.py

Standalone script to push an existing final_leads.json to Supabase.
Useful for testing the DB insert without re-running the full pipeline.

Usage:
    python push_to_db.py
    python push_to_db.py --file final_leads.json --user <user_id>
"""

import json
import argparse
from db.insert import save_pipeline_output


def main():
    parser = argparse.ArgumentParser(description="Push final_leads.json to Supabase")
    parser.add_argument("--file", default="final_leads.json", help="Path to the leads JSON file")
    parser.add_argument("--user", required=True, help="User UUID to associate with this run")
    args = parser.parse_args()

    with open(args.file, encoding="utf-8") as f:
        output = json.load(f)

    print(f"Pushing {output['meta']['total_leads']} leads to DB...")
    print(f"  Niche:   {output['meta']['niche']}")
    print(f"  Service: {output['meta']['service']}")

    run_id = save_pipeline_output(output, args.user)
    print(f"\nDone. run_id = {run_id}")


if __name__ == "__main__":
    main()
