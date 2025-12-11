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
