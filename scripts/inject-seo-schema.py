#!/usr/bin/env python3
"""Inject JSON-LD structured data into Swapio pages for SEO."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_JS = ROOT / "js" / "shared.js"

SITE_URL = "https://swapio.cc"
LOGO_URL = f"{SITE_URL}/assets/logo-512.png"


def read_data() -> str:
    return DATA_JS.read_text(encoding="utf-8")


def parse_reviews(text: str) -> list[dict]:
    reviews = []
    for body, name, meta in re.findall(
        r"text:\s*'((?:\\'|[^'])*)',\s*name:\s*'([^']+)',\s*meta:\s*'([^']+)'",
        text,
    ):
        reviews.append(
            {
                "text": body.replace("\\'", "'"),
                "name": name,
                "meta": meta,
            }
        )
    return reviews


def review_nodes(reviews: list[dict], limit: int = 3) -> list[dict]:
    nodes = []
    for review in reviews[:limit]:
        nodes.append(
            {
                "@type": "Review",
                "author": {"@type": "Person", "name": review["name"]},
                "reviewBody": review["text"],
                "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5",
                    "worstRating": "1",
                },
            }
        )
    return nodes


def aggregate_rating(review_count: int) -> dict:
    return {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": review_count,
        "bestRating": "5",
        "worstRating": "1",
    }


def organization() -> dict:
    return {
        "@type": "Organization",
        "name": "Swapio",
        "url": SITE_URL,
        "email": "support@swapio.cc",
        "logo": LOGO_URL,
        "description": "Turn unused gift cards into cash. Get 95% of your card value via PayPal, Cash App, Zelle, Venmo, Bitcoin, or bank transfer.",
    }


def format_json_ld(data: dict) -> str:
    body = json.dumps(data, indent=2, ensure_ascii=False)
    indented = "\n".join(f"  {line}" for line in body.splitlines())
    return f"  <script type=\"application/ld+json\">\n{indented}\n  </script>"


def insert_ld_json(html: str, schema: dict) -> str:
    block = format_json_ld(schema)
    if re.search(r"<script[^>]*type=\"application/ld\+json\"", html):
        return re.sub(
            r"  <script type=\"application/ld\+json\">.*?</script>",
            block,
            html,
            count=1,
            flags=re.S,
        )
    return html.replace("</head>", f"{block}\n</head>", 1)


def patch_file(path: Path, schema: dict) -> None:
    html = path.read_text(encoding="utf-8")
    html = insert_ld_json(html, schema)
    path.write_text(html, encoding="utf-8")
    print(f"patched {path.relative_to(ROOT)}")


def build_schemas(reviews: list[dict]) -> dict[Path, dict]:
    review_count = len(reviews)
    rating = aggregate_rating(review_count)
    sample_reviews = review_nodes(reviews)

    home = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "name": "Swapio",
                "url": SITE_URL,
                "description": "Turn unused gift cards into cash fast. 95% payout, 60+ brands accepted.",
                "inLanguage": "en-US",
                "publisher": organization(),
            },
            {
                "@type": "Service",
                "@id": f"{SITE_URL}/#service",
                "name": "Gift Card to Cash Exchange",
                "provider": organization(),
                "url": SITE_URL,
                "areaServed": "US",
                "description": "Swap unused gift cards for cash at 95% of card value via PayPal, Cash App, Zelle, Venmo, Bitcoin, or bank transfer.",
                "aggregateRating": rating,
                "review": sample_reviews,
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "5% service fee — sellers receive 95% of gift card balance",
                    "availability": "https://schema.org/InStock",
                    "url": f"{SITE_URL}/sell-gift-card/",
                },
            },
        ],
    }

    feedback = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Seller Feedback | Swapio",
        "url": f"{SITE_URL}/feedback",
        "description": "Real seller reviews on swapping gift cards for cash with Swapio.",
        "isPartOf": {"@type": "WebSite", "name": "Swapio", "url": SITE_URL},
        "aggregateRating": rating,
        "review": review_nodes(reviews, limit=6),
    }

    guide = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Swap Gift Cards for Cash on Swapio",
        "description": "Four simple steps to turn unused gift cards into cash with Swapio.",
        "totalTime": "PT15M",
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Choose Your Card",
                "text": "Search 60+ brands and enter your gift card balance on Swapio.",
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "Get Your Offer",
                "text": "See your 95% cash payout before you submit.",
            },
            {
                "@type": "HowToStep",
                "position": 3,
                "name": "Submit Details",
                "text": "Enter card and payout info securely.",
            },
            {
                "@type": "HowToStep",
                "position": 4,
                "name": "Get Paid",
                "text": "Most swaps pay out within a day via your preferred method.",
            },
        ],
    }

    contact = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Reach Us | Swapio",
        "url": f"{SITE_URL}/contact",
        "description": "Contact Swapio support for help with your gift card swap.",
        "mainEntity": organization(),
    }

    sell = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Complete Your Swap | Swapio",
        "url": f"{SITE_URL}/sell-gift-card/",
        "description": "Complete your Swapio gift card swap and receive cash via PayPal, Cash App, Zelle, Venmo, Bitcoin, or bank transfer.",
        "isPartOf": {"@type": "WebSite", "name": "Swapio", "url": SITE_URL},
        "about": {"@id": f"{SITE_URL}/#service"},
    }

    return {
        ROOT / "index.html": home,
        ROOT / "feedback.html": feedback,
        ROOT / "guide.html": guide,
        ROOT / "contact.html": contact,
        ROOT / "sell-gift-card" / "index.html": sell,
    }


def main() -> None:
    reviews = parse_reviews(read_data())
    for path, schema in build_schemas(reviews).items():
        patch_file(path, schema)


if __name__ == "__main__":
    main()