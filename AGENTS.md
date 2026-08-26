# AGENTS.md

Product design guidelines. Read this before creating or changing product UI.

## Which product?

Find the relevant product in this folder:

| Product | Bootstrap version | Readme |
|---|---|---|
| Filmmakers System | v6 | [products/filmmakers-system/README.md](products/filmmakers-system/README.md) |

Every product has its own:

- Foundations — colour, type, grid, and layout
- Components — decisions on how to use Bootstrap components

Shared behaviour patterns live in [patterns](patterns/).

## Source precedence

Use these sources together, in this order:

1. The production frontend — components, tokens, and APIs that actually exist
2. These product guidelines — which supported options to use and how
3. The product's Bootstrap version — implementation contract and fallback defaults
4. General UI/UX knowledge — only where the sources above are silent

These guidelines may restrict Bootstrap choices but MUST NOT invent unsupported Bootstrap APIs or production components. If a guideline conflicts with the production implementation, **ASK** rather than inventing a third approach.

## Working order

1. Identify the product and read its README.
2. Read the relevant shared pattern.
3. Read the product foundations that supply its values.
4. Read the product component guidance for permitted Bootstrap combinations.
5. Use the product's Bootstrap defaults only where these guidelines are silent.

## ASK

Where a page says **ASK**, the decision has not been made. Do not infer it or pick the most reasonable option.

Stop and put the question to the person. If no answer comes, deliver everything else and leave the ASK point visibly unresolved. **An unresolved ASK is a valid deliverable. A guessed answer is not.**

## Status

Each page header has a status.

| Status | Agent behaviour |
|---|---|
| Draft | Follow the rules. Do not invent alternatives. Expect the page to change. |
| Approved | Follow the rules. Treat them as binding. |
| Banned | Do not use. If you find it in code you are changing, remove it. |

## Rule format

Rules are MUST / SHOULD / MAY. MUST is not negotiable.

Each detailed page ends with `Unresolved`. Read it. A rule under `Watching` is still a rule.
