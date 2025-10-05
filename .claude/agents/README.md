# Web Game Development Team - Claude Agents

This directory contains specialized Claude Code agents for web game development. Each agent is an expert in their domain and can be invoked to help with specific tasks.

## 🎯 Quick Start: Creating a Complete Game

Want to create a full game? Use the **Game Director**:

```
@game-director Create a simple matching card game for children
```

The Game Director will coordinate all other agents to design, build, test, and deliver a complete game!

---

## Available Agents

### 🎬 Game Director (`game-director`) ⭐ **START HERE**
**Role**: Master orchestrator - coordinates all agents to complete full game projects

**Use for**:
- Creating complete games from scratch
- Managing complex multi-phase projects
- Coordinating team workflow
- Ensuring quality throughout development
- Delivering polished, documented games

**This is your main agent for game projects!** It will automatically invoke other specialist agents as needed.

**Example invocation**:
```
@game-director Create a puzzle game where players match cooking ingredients
@game-director Build a simple runner game with our Magic Chef theme
@game-director Add a new level system to the existing maze game
```

---

### 1. 🎮 Game Designer (`game-designer`)
**Role**: Game concept design, mechanics, and player experience

**Use for**:
- Creating new game concepts and ideas
- Designing game mechanics and rules
- Balancing difficulty and progression
- Writing game design documents
- Designing level layouts and challenges

**Example invocation**:
```
@game-designer Design a simple puzzle game suitable for children
```

---

### 2. 💻 Frontend Developer (`frontend-developer`)
**Role**: HTML/CSS/JavaScript implementation

**Use for**:
- Writing clean, semantic HTML
- Creating responsive CSS layouts
- Implementing JavaScript functionality
- Integrating UI with game logic
- Code quality and standards

**Example invocation**:
```
@frontend-developer Implement a responsive game menu with these sections...
```

---

### 3. ⚙️ Game Mechanics Engineer (`game-mechanics-engineer`)
**Role**: Core game systems, physics, and logic

**Use for**:
- Implementing game physics and collision detection
- Creating game loops and state management
- Building scoring and achievement systems
- Implementing AI and pathfinding
- Optimizing game logic performance

**Example invocation**:
```
@game-mechanics-engineer Implement a smooth jumping mechanic with variable jump height
```

---

### 4. 🎨 UI/UX Designer (`ui-ux-designer`)
**Role**: Visual design and user experience

**Use for**:
- Designing game interfaces and HUDs
- Creating visual themes and style guides
- Improving user experience and flows
- Ensuring accessibility compliance
- Designing responsive layouts

**Example invocation**:
```
@ui-ux-designer Review this game's UI for accessibility and mobile friendliness
```

---

### 5. 🧪 QA Tester (`qa-tester`)
**Role**: Quality assurance and testing

**Use for**:
- Testing game functionality
- Finding bugs and edge cases
- Cross-browser compatibility testing
- Performance testing
- Writing bug reports

**Example invocation**:
```
@qa-tester Test this game and report any bugs or usability issues
```

---

### 6. ⚡ Performance Optimizer (`performance-optimizer`)
**Role**: Performance optimization and profiling

**Use for**:
- Profiling game performance
- Optimizing rendering and animations
- Reducing memory usage
- Improving FPS and responsiveness
- Asset optimization

**Example invocation**:
```
@performance-optimizer This game is running slow on mobile, help optimize it
```

---

### 7. 📝 Project Chronicler (`project-chronicler`)
**Role**: Documentation and knowledge management

**Use for**:
- Recording development progress and milestones
- Documenting lessons learned and best practices
- Creating architecture decision records (ADRs)
- Maintaining knowledge base and troubleshooting guides
- Writing project retrospectives and summaries
- Capturing successful patterns and mistakes to avoid

**Example invocation**:
```
@project-chronicler Document the lessons learned from this performance optimization
@project-chronicler Create a weekly summary of our development progress
@project-chronicler Record this architecture decision and the rationale behind it
```

---

## How to Use Agents

### Interactive Command
Use the `/agents` command to interactively select and invoke agents:
```
/agents
```

### Direct Invocation
Mention an agent directly in your message:
```
@game-designer I need a new mini-game concept for a cooking theme
```

### Agent Chaining
You can involve multiple agents in sequence:
```
@game-designer Create a simple matching game
@frontend-developer Implement the design
@qa-tester Test the implementation
```

### With Task Tool
Invoke agents programmatically using the Task tool (from main Claude):
```javascript
// Example: Use game-designer agent
Task({
  subagent_type: "game-designer",
  description: "Design puzzle game",
  prompt: "Create a puzzle game concept for children aged 6-10"
})
```

---

## Workflow Examples

### Creating a New Game (Recommended: Use Game Director)

**Simple approach - Let the director handle everything:**
```
@game-director Create a memory matching card game for kids
```

The Game Director will automatically:
1. Work with **@game-designer** to create game concept
2. Ask **@project-chronicler** to document design decisions
3. Coordinate **@ui-ux-designer** to design visuals and generate assets
4. Direct **@frontend-developer** to implement HTML/CSS structure
5. Guide **@game-mechanics-engineer** to implement game logic
6. Have **@qa-tester** test the game
7. Call **@performance-optimizer** to optimize performance
8. Request **@project-chronicler** to create project summary

**Manual approach - For learning or custom control:**
1. **@game-designer** - Create game concept and mechanics
2. **@project-chronicler** - Document the design decisions
3. **@ui-ux-designer** - Design the visual interface
4. **@frontend-developer** - Implement HTML/CSS structure
5. **@game-mechanics-engineer** - Implement game logic
6. **@qa-tester** - Test the game
7. **@performance-optimizer** - Optimize performance
8. **@project-chronicler** - Create project summary and lessons learned

### Improving Existing Game

**Using Game Director:**
```
@game-director The maze game is running slow on mobile, please improve it
```

**Manual approach:**
1. **@qa-tester** - Identify issues and areas for improvement
2. **@ui-ux-designer** - Review and improve UX
3. **@frontend-developer** - Implement UI improvements
4. **@game-mechanics-engineer** - Fix logic issues and improve mechanics
5. **@performance-optimizer** - Profile and optimize
6. **@qa-tester** - Verify improvements
7. **@project-chronicler** - Document improvements and learnings

### Bug Fixing

**Using Game Director:**
```
@game-director There's a collision detection bug in the runner game
```

**Manual approach:**
1. **@qa-tester** - Reproduce and document the bug
2. **@game-mechanics-engineer** or **@frontend-developer** - Fix the bug
3. **@qa-tester** - Verify the fix
4. **@project-chronicler** - Record the bug and solution for future reference

### Sprint/Weekly Retrospective
1. **@project-chronicler** - Compile weekly development summary
2. **@project-chronicler** - Document lessons learned
3. **@project-chronicler** - Update best practices guide
4. All team - Review documentation and provide feedback

---

## Best Practices

### 1. **Use the Right Agent for the Job**
   - Don't ask the game-designer to write code
   - Don't ask the frontend-developer to design game mechanics
   - Each agent is optimized for their specialty

### 2. **Provide Context**
   - Share relevant file paths
   - Describe what you've already tried
   - Explain the target audience and platform

### 3. **Be Specific**
   - Clear requirements lead to better results
   - Provide examples when possible
   - State constraints (browser support, performance targets, etc.)

### 4. **Iterate**
   - Use agents multiple times to refine work
   - Combine feedback from multiple agents
   - Test and improve progressively

### 5. **Leverage Expertise**
   - Ask @performance-optimizer for optimization advice BEFORE implementing
   - Consult @ui-ux-designer early in the design process
   - Get @qa-tester involved throughout development

---

## Configuration

Agents are configured with:
- **name**: Unique identifier for invocation
- **description**: Purpose and specialty
- **tools**: Available tools for the agent
- **model**: AI model to use (sonnet by default)

To modify an agent, edit the corresponding `.md` file in this directory.

To create a new agent, create a new `.md` file with the frontmatter format:
```markdown
---
name: my-agent
description: What this agent does
tools: Read, Write, Edit
model: sonnet
---

Agent system prompt and instructions here...
```

---

## Tips

### For Complete Game Projects
- **🎬 Use @game-director**: For full games, let the director coordinate everything
- **Clear Requirements**: Tell the director exactly what you want to build
- **Trust the Process**: The director follows proven workflows
- **Review Milestones**: Check work at each phase before moving forward

### For Specific Tasks
- **Performance**: If a game is slow, consult @performance-optimizer (or ask @game-director)
- **Design Review**: Use @ui-ux-designer to review before considering a game "done"
- **Testing**: Involve @qa-tester early and often
- **Architecture**: For complex systems, consult @game-mechanics-engineer for advice
- **Polish**: @frontend-developer can add final touches and code cleanup
- **Documentation**: Use @project-chronicler to document decisions, lessons, and progress
  - Document as you go, not at the end
  - Record both successes and mistakes
  - Keep a weekly development log
  - Create architecture decision records for major choices

### When to Use Which Approach
- **Use @game-director**: When you want a complete game or major feature
- **Use specialist agents directly**: When you need specific expertise or are learning
- **Mix both approaches**: Director for overall project, specialists for refinements

---

## Support

For issues with agents or to request new specialists:
1. Check the [Claude Code documentation](https://docs.claude.com/en/docs/claude-code/sub-agents.md)
2. Review agent configuration files in this directory
3. Modify or create agents as needed for your workflow

---

**Happy Game Development! 🎮**
