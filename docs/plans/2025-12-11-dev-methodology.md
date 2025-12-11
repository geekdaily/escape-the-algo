# Dev Methodology Implementation Plan

**Date:** 2025-12-11
**Branch:** `claude/dev-methodology-01DPDr7qEk7tngrjPvRwnNm8`
**Status:** Draft

---

## Original Prompt

> **We're going to set up for spec or prompt driven development.**
>
> For each iteration we do together, we will:
>
> * **Make a new branch that's appropriately named**
>   * Sometimes I'll give you a name for the branch; if I don't, you should suggest a name and ask me if we should use that one or if I have a better name.
>   * You'll add the required prefix and suffix needed to pass your stop hook
> * **Write a new plan** using your `writing-plans` skill
>   * Capture the prompt or a pointer to an existing spec to append to the plan
>   * Ask any questions you need to in order to flesh out the plan
>   * Write the plan in the `docs/plans` directory
> * **Ask permission, then execute the plan.**
>
> Please demonstrate that workflow by turning this prompt into a plan on a branch named "dev-methodology". This methodology should also persist in your settings for this project.

---

## Design Decisions

1. **Methodology location:** `CLAUDE.md` at project root
2. **Branch naming:** `claude/<descriptive-name>-<session-id>` (required format for push access)
3. **Plan approval:** Summarize plan, ask to execute, then execute entire plan
4. **Spec handling:** Reference at head of plan, copy relevant content into plan as holistic document

---

## Implementation Tasks

### Task 1: Check if CLAUDE.md exists

**Action:** Check for existing CLAUDE.md file

```bash
ls -la CLAUDE.md 2>/dev/null || echo "File does not exist"
```

**Verification:** Note whether file exists and has content

---

### Task 2: Create or update CLAUDE.md with dev methodology

**Action:** Add the spec/prompt-driven development methodology section to CLAUDE.md

**Content to add:**

```markdown
# Development Methodology

## Spec/Prompt-Driven Development

For each development iteration:

### 1. Branch Creation
- Create a new branch with format: `claude/<descriptive-name>-<session-id>`
- If no name is provided, suggest one and confirm before creating
- The `claude/` prefix and session-id suffix are required for push access

### 2. Plan Writing
- Use the `writing-plans` skill to create a detailed implementation plan
- Save plans to `docs/plans/YYYY-MM-DD-<feature-name>.md`
- Plan structure:
  - **Original prompt/spec** - Copy the full prompt or reference + relevant excerpts
  - **Design decisions** - Document answers to clarifying questions
  - **Implementation tasks** - Bite-sized steps (2-5 min each) with verification
- Ask clarifying questions before writing the plan
- Plans should be holistic documents requiring no external references

### 3. Execution
- Summarize the plan and ask permission to execute
- Upon approval, execute the entire plan
- Commit and push completed work
```

**Verification:** Read CLAUDE.md and confirm methodology section is present and complete

---

### Task 3: Commit changes

**Action:** Stage and commit the new files

```bash
git add CLAUDE.md docs/plans/2025-12-11-dev-methodology.md
git commit -m "Add spec/prompt-driven development methodology"
```

**Verification:** `git log -1` shows the commit with correct message

---

### Task 4: Push branch

**Action:** Push the branch to remote

```bash
git push -u origin claude/dev-methodology-01DPDr7qEk7tngrjPvRwnNm8
```

**Verification:** Push succeeds without errors

---

## Summary

This plan creates 2 files:
- `CLAUDE.md` - Project settings with dev methodology (new or updated)
- `docs/plans/2025-12-11-dev-methodology.md` - This plan document

Total tasks: 4
Estimated changes: 2 files added/modified
