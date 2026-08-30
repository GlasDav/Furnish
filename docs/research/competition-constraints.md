# WebMCP Challenge competition constraints

Research date: 2026-08-30 (Australia/Sydney)  
Related work item: [GitHub issue #3](https://github.com/GlasDav/Furnish/issues/3)

## Answer

The competition is **open as of 2026-08-30**. Registration and submissions close on **September 3, 2026 at 1:00 pm PDT**, which is **September 4, 2026 at 6:00 am AEST in Sydney**. The official page still shows “Join hackathon,” and the date falls inside the official registration and submission periods. Sources: [competition overview](https://webmcp.devpost.com/) and [official rules, section 1](https://webmcp.devpost.com/rules).

The build must reach a working, publicly reviewable state before that deadline. The required submission is a live WebMCP app, a four-part written explanation, a public open-source repository, and a public YouTube demo **shorter than three minutes**. Stage one checks basic theme and WebMCP viability; qualifying entries are then scored equally on WebMCP leverage, execution, potential impact, and creativity/ambition. Sources: [competition overview](https://webmcp.devpost.com/) and [official rules, sections 4 and 7](https://webmcp.devpost.com/rules).

## Schedule

| Event | Official Pacific Time | Sydney time (AEST, derived) |
| --- | --- | --- |
| Registration | August 25, 2026, 11:00 am – September 3, 2026, 1:00 pm | August 26, 4:00 am – September 4, 6:00 am |
| Submission | August 25, 2026, 11:00 am – September 3, 2026, 1:00 pm | August 26, 4:00 am – September 4, 6:00 am |
| Judging | September 4, 2026, 10:00 am – September 21, 2026, 5:00 pm | September 5, 3:00 am – September 22, 10:00 am |
| Winners announced | On or around September 23, 2026, 2:00 pm | On or around September 24, 7:00 am |

Source: [official rules, section 1](https://webmcp.devpost.com/rules). Devpost labels the displayed deadline PDT; Sydney remains on AEST for all dates above.

An optional Netlify-credit request has an earlier deadline: **September 1, 2026 at 12:00 pm PT**, with credits to be redeemed by October 3. This is optional and should not block the build. Source: [official rules, section 4](https://webmcp.devpost.com/rules).

Drafts may be edited before the submission deadline. After it closes, the official rules say the submission cannot be altered. The official FAQ goes further: do not modify the submitted Devpost entry, repository, or live site during judging because this can put eligibility at risk; use a separate repository fork if development must continue. Treat this as a freeze from **September 3 at 1:00 pm PDT through the winner announcement**. Sources: [official rules, section 6](https://webmcp.devpost.com/rules) and [official FAQ](https://webmcp.devpost.com/resources).

## Required submission assets

1. **Working live URL.** It must be accessible using ChatGPT’s in-app browser or WebMCP-enabled Google Chrome. ChatGPT Sites is explicitly allowed, as are Cloudflare, Vercel, Render, Netlify, and other hosts. Authentication is allowed only if credentials are supplied on the submission form. Source: [official rules, submission requirements](https://webmcp.devpost.com/rules).
2. **Text description.** It must explain why the use case fits WebMCP, how it improves the user experience, what people and agents can do together that was previously difficult or impossible, and briefly how WebMCP was implemented. Source: [competition requirements](https://webmcp.devpost.com/).
3. **Public source repository.** Supply a public GitHub, GitLab, or Bitbucket URL containing all source, assets, and instructions needed to run the app. It must include an open-source licence that GitHub detects and shows at the top/About area. The published source must visibly include the real `document.modelContext.registerTool(...)` implementation. Source: [official rules, submission requirements](https://webmcp.devpost.com/rules).
4. **Public YouTube demo.** It must be **less than three minutes**, clearly show the working app, and include audio explaining what was built and how WebMCP was used. Link it on the submission form. Judges need not watch beyond three minutes. It must not include third-party trademarks, copyrighted music, or other protected material without permission. Source: [official rules, submission requirements](https://webmcp.devpost.com/rules).
5. **Testing access and instructions.** The app must remain available free of charge and without restriction through **September 21, 2026 at 5:00 pm PT**. If private, supply credentials. Judges are not required to run the app and may judge only from the text, images, and video. Source: [official rules, testing](https://webmcp.devpost.com/rules).
6. **English materials.** All submission materials must be in English or include an English translation. Source: [official rules, language requirements](https://webmcp.devpost.com/rules).

## Project and eligibility constraints

The entry must be a WebMCP-powered web app about human-agent interaction, collaboration, or creation. It must run consistently on its stated platform and work as shown or described. Source: [official rules, project requirements](https://webmcp.devpost.com/rules).

It must either be newly created during the submission period or be an existing project meaningfully extended with WebMCP after **August 25, 2026 at 11:00 am PT**. Existing projects need clear dated evidence separating old work from the new WebMCP work; only the new work is evaluated. Third-party code, APIs, data, and assets require the relevant authorization and licence compliance. An open-source base must be enhanced, not merely resubmitted. Source: [official rules, project requirements and intellectual property](https://webmcp.devpost.com/rules).

Individuals must have reached the age of majority where they live. Individuals, teams, and organizations must be based in a supported and non-excluded country or territory and must satisfy the conflict exclusions. Australia is on OpenAI’s current [supported-country list](https://developers.openai.com/api/docs/supported-countries), so an Australian entrant satisfies the location condition, subject to the other rules. Source: [official rules, section 3](https://webmcp.devpost.com/rules).

## Judging criteria

Stage one is pass/fail: the project must reasonably fit the theme and apply the required APIs/SDKs. Source: [official rules, section 7](https://webmcp.devpost.com/rules).

Projects that pass are scored on four **equally weighted** criteria:

1. **WebMCP Leverage:** thorough, skillful, working, non-trivial WebMCP use and genuine effort visible in the code.
2. **Execution:** a working/runnable, complete, coherent product experience rather than only a technical proof of concept.
3. **Potential Impact:** a credible, specific problem and audience, with a demonstrated solution that addresses them.
4. **Creativity & Ambition:** novelty and differentiation from existing concepts.

Source: [official rules, section 7](https://webmcp.devpost.com/rules).

## Critical-path implications for Furnish

- Prioritize a reliable hosted sample workflow over optional planner features.
- Make the WebMCP implementation visibly non-trivial in the demo and public source.
- Record the video to a target of about 2:45–2:50 so it is safely below three minutes.
- Add the open-source licence, run instructions, testing instructions, and Devpost text before submission.
- Keep the deployed URL working, free, and unchanged throughout judging.
- Preserve dated commits proving that the qualifying WebMCP work occurred during the submission window.
- Plan to freeze the submitted repository and deployment at the deadline; this is the main schedule constraint after submission.
