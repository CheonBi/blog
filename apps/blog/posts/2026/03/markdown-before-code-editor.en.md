---
title: 'Opening <em>Markdown</em> Instead of Code Editors in Development'
tags:
  - ai
  - development
  - markdown
  - workflow
  - code-review
published: false
date: 2026-03-12 12:00:00
description: "Don't start implementing—write the requirements first."
thumbnail: /thumbnails/2026/03/markdown-before-code-editor.png
---

## Table of Contents

## TL;DR

- In the AI era, a developer's role is shifting from someone who writes code to someone who specifies requirements and verifies results.
- Instead of jumping straight into implementation, we need to change our workflow: first specify requirements → delegate implementation to LLMs → focus human effort on verification and judgment.
- At the same time, we must intentionally preserve time for writing code directly to maintain our judgment capabilities.

## I believe there's an order to AI replacement

While using AI coding tools lately, one uncomfortable question keeps lingering in my mind: "Will this work I'm doing now still need to be done by humans a year from now?" I'm probably not the only one thinking this.

If we roughly list a developer's tasks by stage and difficulty, it looks like this:

**Code writing → Code review → Architecture design → Technical decision-making**

AI is encroaching on this sequence starting from the front.

Code writing is already faster with AI than humans, and in some cases more accurate. To give you a real example I experienced: a component implementation that used to take me half a day was completed by Claude Code in under 3 minutes when I handed over the specifications. The types were correct, edge case handling was pretty decent. The quality difference from what I would have written directly was negligible.

Code review is also becoming capable of contextual feedback that goes beyond static analysis. As an aside, I heard Claude Code Review costs $15 per PR. Human reviewers are still cheaper for now (??), but everyone can predict this price will drop rapidly.

Architecture design and technical decision-making are still human territory. But honestly, I'm not sure how long that will last either.

Yet most of us are still only using AI for the front two stages. Auto-completing code with Copilot, attaching AI reviewers to PRs—that's about it. We're not spending time developing the capabilities AI finds harder to replace—the ability to structure requirements, design judgment based on domain knowledge.

Actually, there's a pattern I've observed around me since tools like Claude Code were introduced. When work comes up, immediately throw it to the LLM, receive the output, submit a PR, done. This loop is getting shorter and shorter. It's fast so it's convenient, and because it's convenient, we repeat it. The problem is that within this loop, all humans do is "throw" and "paste." There's no time for analyzing requirements or deeply verifying the output.

To be frank, our lifespan as developers depends on the latter capabilities in those four stages—the ones AI can't easily replace. The ability to type code quickly was never a differentiating factor before, and it's even less so now. The ability to accurately analyze requirements, identify constraints, and judge trade-offs. This doesn't improve just by writing lots of code.

So I propose changing how we work. However, this approach doesn't apply to production incident response, hotfixes, or urgent debugging. This is about "plannable work"—new feature development, planned refactoring, component design.

"Organize requirements first, break them down small, and retrospect in short cycles." Reading this far, you might think—isn't this just Agile/Scrum? You're right. The skeleton is the same. What's different is the execution layer. Previously, we organized requirements and then humans implemented directly. Now we delegate that implementation to LLMs, and humans focus on specification precision and output verification. The process hasn't changed—where humans stand within the process has changed.

## Small-scale work: Opening markdown before code editors

For creating new components, adding a feature, or simple refactoring—until now we'd open the code editor and start implementing right away. Going forward, we'll change it like this.

**Step 1: Write requirements in markdown first.**

Document what needs to be built, what the constraints are, and what form the expected output should take. Define the "what" and "why" in text first, not code. Include acceptance criteria at this stage. These acceptance criteria become both verification standards and test cases later.

What's really important here is not delegating this specification writing itself to AI. The process of organizing requirements is design itself, and having humans do that design directly is the core of this workflow. The moment you throw "organize the requirements for me" to AI, you're back to the "throw → paste" loop. Of course, it's fine to show AI your handwritten draft and have it refine missing parts or expressions. The key is that the first thought must come from humans. If you outsource the start of this stage to AI, all subsequent processes become meaningless.

**Step 2: Instruct the LLM with this.**

Based on the organized requirements, delegate implementation to the LLM. The key is not "what I'm typing" but "executing what I defined."

**Step 3: Humans directly verify the output.**

This is the most important part. Whether the LLM-generated code meets requirements, has no security vulnerabilities, handles edge cases, has no performance issues—this verification must be done by humans.

The density of thought we used to put into coding must now be poured into review. What happens if we delegate review to AI too? We get a structure where the same model writes and the same model verifies. Since systems with the same blind spots are verifying themselves, they miss the same things. The time saved from code writing should actually increase the human time and thought invested in review.

Comparing Before and After looks like this:

```
Before:
1. Open code editor
2. Organize requirements mentally while implementing
3. Submit PR after finishing
4. Get asked "Why did you do it this way?" in review

After:
1. Write requirements, constraints, acceptance criteria in markdown
2. Instruct LLM
3. Human directly verifies output based on acceptance criteria
4. Leave requirement specification as documentation with code
```

This approach has side effects too. Writing requirements in text first forces design before implementation, making "define what to build first" the default mode instead of "just build and see." And this specification stays with the code. In repositories with only code, you can't know "why it was built this way," but with requirement specifications together, code intent remains as documentation. When someone else—or future you—needs to modify this code later, they can immediately grasp the context without digging through PRs.

One more thing. The higher your position, the more you write text rather than code. Organizing technical decisions into reports, structuring evidence to persuade planning/design. The process of repeatedly writing requirement specifications naturally builds this capability.

## Large-scale work: Analyzing and breaking down together from design phase

Refactoring or large-scale requirements are different. They're not the size where you can write one markdown and throw it to an LLM.

**Don't start immediately.** Have two or more people participate from the design phase to analyze the entire requirements. Organize these analysis results in markdown, specifying not only "what to build" but also "what not to build." Most large-scale work with unclear scope starts having problems here.

This stage requires domain knowledge and understanding of the codebase. "How to handle state management," "whether to go with SSR or CSR for rendering strategy," "where to place error boundaries"—without these judgments, you can't assess the quality of LLM output even with markdown. Without knowing the business domain, you can't properly define requirements themselves, and without knowing the codebase, you can't filter out outputs that conflict with existing structure. It's not about not writing code—it's about people who can write code choosing not to.

**Break down the organized overall requirements into small units.** The criteria for "small units" is clear: a size that can be sufficiently explained with one markdown specification, and a size that can be reviewed in one PR. Breaking it down this way means each small requirement follows the small-scale work flow mentioned earlier. In other words, the key is making big problems into "markdown-specifiable size."

```
Large-scale requirements
  → 2+ people design analysis + markdown organization
    → Small requirement A (→ small-scale work flow)
    → Small requirement B (→ small-scale work flow)
    → Small requirement C (→ small-scale work flow)
    → ...
```

## Short feedback loops: Weekly retrospectives

LLM-based work is faster than before. When speed is fast, going off course is also fast. And above all, since this is a method we've never tried before, there will be lots of trial and error. So we keep retrospective cycles short at one week.

Four things to check weekly:

- How was the quality of requirement specifications written last week? When instructing the LLM, did we get expected results, or were there many modifications due to insufficient specifications?
- Was the breakdown of work units appropriate? Were they too big or broken down too small?
- Was anything missed in the verification process?
- What lessons were learned while working with LLMs?

Extending to 2 weeks or 4 weeks slows feedback, leading to repeating the same mistakes. One week allows quick corrections.

## Conditions where this approach might not work well

Honestly, this approach has obvious limitations. Starting with awareness is different from starting without knowledge, so I'll lay them out upfront.

**Variance in specification writing ability.** Code can be tested by running it, but specification quality is hard to measure immediately. When two people write the same requirements, LLM output quality will differ greatly. The "specification quality check" in the weekly retrospectives I mentioned earlier is essentially the answer to this problem. There's no choice but to run the cycle of writing specifications, seeing results, and writing better next time at the team level.

**"Time spent writing specifications = inefficiency" perception.** In environments demanding fast delivery, someone opening markdown first appears slower than someone immediately coding. Without team-level consensus on this, individual efforts won't sustain no matter how hard you try. There needs to be team-level agreement that "writing specifications first isn't slow—it's advancing design."

**Gradual degradation of verification ability.** I'll propose defending this with "sacred time" in the next section, but honestly this is a solution that depends on self-discipline, so it's structurally weak. When busy, "direct coding time" will likely be the first to get cut. This is the biggest risk of this method. There's no structural solution yet. But I believe there's a difference between consciously preserving it and not thinking about it at all.

## Sacred time: Leaving room for direct coding

Reading this far, you might wonder "So humans don't code anymore?" That's not the case. Some portion of a week's work still needs to be consciously reserved as "direct coding time." Areas requiring technical challenges or areas where I feel lacking—this time remains sacred territory not delegated to LLMs. I write first, then ask AI for opinions. If the order reverses, the learning effect disappears.

Especially developers with less experience need to consciously increase the proportion of this time. The number of times you've directly formed hypotheses and tackled debugging becomes the basis for later judging AI output as "this isn't right." If you develop the habit of asking AI first, that basis itself doesn't accumulate. Always be wary of the feeling that "I just read AI-generated code but I feel like I could write it too." That's familiarity, not understanding. Taking 10 minutes to form your own hypothesis before asking AI—that's the most realistic way to bridge the gap between familiarity and understanding.

Why go to such lengths?

First, the joy of being a developer still often comes from creating directly. The flow state felt while coding directly, the satisfaction of creating working output—if we hand all this over to LLMs, the motivation for development work itself disappears. Not many people can do work that's only efficient but not fun for long.

Also, only someone who has directly opened profilers, formed hypotheses, and tried things one by one can form their own hypotheses when facing unfamiliar problems next time. If you tell AI "optimize this component rendering," it will add `useMemo`, wrap with `React.memo` and give you output, but there's a crucial difference between reading that and struggling through it yourself. Can you make your own judgments in situations where patterns don't match? AI click-learning increases "what you know," but direct implementation learning increases "what you can judge." And the ultimate capability difference lies in "what you can judge."

Most importantly, the verification ability of someone who doesn't code at all will degrade over time. Since the core of the workflow I proposed earlier is "judgment and verification," losing the experience of direct coding undermines that core.

## It's just a change in means of expression

The decreasing proportion of code typing and increasing proportion of requirement specification and verification is already happening reality. We should accept this flow, but I don't want to oversimplify it as "just write good markdown." The essence is still software engineering capability—it's just that the medium for expressing that capability is partially shifting from code to specifications.

Honestly, no one knows what will happen going forward. But vague anxiety doesn't change anything. As I said at the beginning, our lifespan depends on capabilities AI finds hard to replace. We need to increase not "what we know" but "what we can judge." Whether code or specifications, what ultimately matters is the ability to accurately define problems software needs to solve and verify whether the output actually solved those problems.

That ability remains valid even when tools change.
