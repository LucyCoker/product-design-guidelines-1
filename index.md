---
layout: default
title: Overview
description: Product design and UX guidance for Filmmakers System.
body_class: home
permalink: /
---

<section class="hero">
  <p class="eyebrow">Filmmakers System · Bootstrap 6</p>
  <h1>Product decisions, written down.</h1>
  <p class="lede">Shared guidance for how our products should look, behave, and communicate—written for product managers, designers, developers, and the AI tools working alongside them.</p>
  <div class="hero-actions">
    <a class="button-link" href="{{ '/products/filmmakers-system/' | relative_url }}">Explore the guidelines</a>
    <a class="button-link secondary" href="https://github.com/denkungsart/product-design-guidelines">View on GitHub</a>
  </div>
</section>

<div class="draft-notice" role="note">
  <span class="draft-icon" aria-hidden="true">i</span>
  <div>
    <strong>This is an early draft.</strong>
    <span>The current rules should be followed, but coverage is incomplete and unresolved decisions remain visibly marked as ASK.</span>
  </div>
</div>

## Browse the current guidance

<div class="card-grid">
  <a class="guideline-card" href="{{ '/patterns/button-hierarchy/' | relative_url }}">
    <small>Shared pattern</small>
    <strong>Button hierarchy</strong>
    <span>Choose emphasis when several actions compete for attention.</span>
  </a>
  <a class="guideline-card" href="{{ '/patterns/destructive-actions/' | relative_url }}">
    <small>Shared pattern</small>
    <strong>Destructive actions</strong>
    <span>Handle irreversible, reversible, and consequential actions safely.</span>
  </a>
  <a class="guideline-card" href="{{ '/products/filmmakers-system/foundations/colour/' | relative_url }}">
    <small>Foundation</small>
    <strong>Colour</strong>
    <span>Apply primary, secondary, status, and accent roles consistently.</span>
  </a>
  <a class="guideline-card" href="{{ '/products/filmmakers-system/foundations/typography/' | relative_url }}">
    <small>Foundation</small>
    <strong>Typography</strong>
    <span>Use the product type scale without sacrificing accessibility.</span>
  </a>
  <a class="guideline-card" href="{{ '/products/filmmakers-system/components/buttons/' | relative_url }}">
    <small>Component</small>
    <strong>Buttons</strong>
    <span>Use the permitted Bootstrap 6 variants, themes, and sizes.</span>
  </a>
</div>

## How the sources work together

This repository is the product-policy layer, not a replacement for Bootstrap or the application itself.

<ol class="source-order">
  <li><div><strong>Production frontend</strong><span>Defines the components and tokens that actually exist.</span></div></li>
  <li><div><strong>Product guidelines</strong><span>Define which supported options to use, when to use them, and why.</span></div></li>
  <li><div><strong>Bootstrap 6</strong><span>Provides implementation behaviour and defaults where product guidance is silent.</span></div></li>
</ol>

## A living reference

The Markdown in this repository powers both this human-readable site and the instructions used by AI agents. As product decisions are reviewed, the same source is updated for everyone.
