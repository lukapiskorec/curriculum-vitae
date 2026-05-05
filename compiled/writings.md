---
type: writings
last_updated: 2026-05-05
items:
  - { id: artist-and-computer-2024, year: 2024, type: essay, status: draft (unpublished at time of writing), venue: "Artist and Computer book contribution" }
  - { id: generative-architecture-qa-2023, year: 2023, type: interview / Q&A, venue: "Generative Architecture: Questions and Answers with Artists & Curators (Verse Works journal)" }
---

# Writings

Long-form personal writing — essays and interviews. Preserved here as canonical text for reference and reuse. Light typographical normalisation only (escaped quotes / dashes); content is unchanged from the source drafts.

---

## 2024 — Artist and Computer (essay draft)

- **Year drafted**: 2024 (October draft)
- **Status**: Draft, unpublished at time of writing
- **Intended venue**: Contribution to *Artist and Computer* book
- **Source document**: `source documents/241007_Artist_and_Computer_Luka_Piskorec_draft.docx`
- **Author byline**: Luka Piskorec / {protocell:labs}

### Learning to code

The process of writing a computer program which facilitates, represents or embodies an artwork is one of the more straining intellectual undertakings an artist can make. It is less so for architects, designers and engineers, who are trained in thinking abstractly, although they often lack tools and concepts to formalize these abstractions in an operative way. I've spent most of my 13 years in academia at various architecture schools to fill that gap in education and provide students with this intellectual tool set.

I had the good fortune of getting introduced to coding at an early age in 4th grade (this was in the mid 90-ties). Although a good student overall, I was struggling with the first computer classes we had. We started coding in Logo where you would write simple instructions to move a turtle around the screen. The turtle had a pen attached to it with which you could draw simple shapes. We were basically writing code for pen-plotters. Loops and conditionals made the turtle do cool things on the screen. I had no real idea how to make it do anything predictable, but the potential of algorithm-driven drawing was already apparent. I distinctly remember having this vision that you should theoretically be able to make the turtle draw complete scenes with realistic characters in them and make them move by drawing many of these frames after each other. If I had only discovered net art which was proliferating around that time I'm sure my mind would have been blown away.

But as I already mentioned, I was quite bad at coding anything in the beginning. We eventually moved on from drawing with the turtle to just working with the text terminal in Basic and later Pascal. No graphics, just ASCII characters. Coding seemed even more abstract now. How the hell were you supposed to make anything with this?! But then, a breakthrough came from an unexpected direction.

Around the 7th grade myself, my brother and a few friends got really into pencil and paper role-playing games (MERP, GURPS, D&D). These are very rule-laden, with thick manuals that explain the mechanics of the game, which have to be played out manually using multi-sided dice for randomness, paper sheet tables for character stats, square or hexagonal grids for movement of characters etc. Turns out that after a few months of playing these campaigns, it became obvious to me how the same mechanics could be replicated using the computer (no graphics required!) I coded my first SUD (single-user dungeon) game soon after in Basic and brought it on a floppy disc to school to show off to my friends. After this, I had no trouble handling code abstractions in my head and figuring out how they could be used to solve real-world problems (like facilitating an RPG game). I realized that I gained a valuable insight on how code works, which I will summarize in a single concept below (you can thank me later!)

In code, numbers (or more generally, data structures) can take two distinct roles. These are syntax-wise implemented the same, but have very different functions. Numbers, namely, can represent DATA or information to be stored, but also INSTRUCTIONS on how to operate on that data. This concept is at the core of von Neumann architecture of our computers, where digital memory stores both data and instructions. In my decades long experience as an educator, establishing this mental model is one of the first hurdles a student will face when learning to code. Possessing it distinguishes students that merely learned the syntax of a programming language, from the ones that are capable of algorithmic thinking.

### In search for a method

As with many generative artists of today, I've come to the field from a very different angle than a traditional artist. I've studied architecture at the University of Zagreb, a school with a very traditional approach to design. Even if it is rooted in Bauhaus' school, it is already more than a century old. Use of computers was forbidden in the freshmen year as it was somehow considered virtuous for our training to painstakingly create technical drawings by hand. This was in 2005 mind you, at the onset of social-media revolution (Facebook in 2004) and proliferation of smart-phones as mobile computers (first iPhone in 2007). Even to a small-town teenager at the time it was obvious that the future will look very different than what our teachers led us to believe. Sure enough, as soon as I set foot into an architecture office as an intern some years later, the only paper drawings and plans I saw were the ones coming straight out of the ink-jet plotter — one of my first tasks was to fold dozens of them at the time late into the night.

I was very lucky to get a chance to continue my architecture studies at ETH Zürich in 2009, a very progressive school led by the innovation-obsessed Swiss. That was where I first came into contact with computational design — doing design through code, and I could finally leverage my somewhat forgotten coding skills. Ironically, you could relate their approach to Bauhaus school as well, except coding and digital methodologies were also considered integral to the education of students. Since then, I've considered coding as a third form of literacy, right after reading/writing and numeracy (math skills), which themselves are standard part of school-child's curricula since at least the ancient Greeks.

My time studying (and finally graduating) and later working in Zürich were my most formative years as a computational architect. I learned to apply code to solve everyday engineering and design problems, express design intent through it, optimize solutions in a rigorous way, and even build physical objects and structures using 3D printers and large six-axis industrial robots — the ones that build all of our cars today. Over time, in search for purer forms of algorithmic expression, I explored concepts rooted in computation and the digital realm far removed from the messy process of actual construction with physical materials. During the COVID pandemic in 2020 and social isolation that followed, I reached the peak of this effort by attempting to write a textbook on mathematical principles of computational design. Its draft of over 500 pages is still sitting on my hard drive, unpublished, from time to time offering inspiration to my work.

In the 21st century, computers have become ubiquitous tools for designers, architects and even artists. In design work, they can act as digital stand-ins for traditional drawing implements used for centuries: rulers, compasses, protractors, and pantographs. However, computers offer us much more than these. Their built-in Von Neumann architecture processes data as well as the code instructions that operate on it. Alongside the invention of the calculating machine, we developed formal languages to communicate with computers. For the first time in history, we invented languages specifically to interact with machines. This allows us to use computers not only as drawing tools but as programmable drawing agents themselves. This "agency" of the computer enables us to explore designs that were previously exclusive to Nature herself.

Driven to explore these topics further in a more systematic manner, in 2021 I co-founded {protocell:labs} with a fellow computational architect Kane Borg, establishing it as a digital laboratory that merges artistic and research practices. Within the lab, we explore computational structures, mathematical forms of organization, design algorithms, artificial biology, emergent morphogenesis, and digital graphics. Our mission is to probe a more dynamic side of generative art and further our curiosity into deep topics permeating our technological world. Every collection is a process of discovery, a journey forward into the unknown, each step influenced by what came before.

### Observations and principles

**Rules rule the world.** All natural processes are governed by a finite set of interconnected rules. While the rules themselves may be simple, the consequences of their interactions are not. These rules inherent to Nature, when formulated properly, can be translated into code and used to derive computational states. We cannot make assumptions about Nature's true goals or purposes. However, we can say that Culture attempts to imitate Nature and ultimately strives to supersede her.

**Object- vs function-oriented world view.** From a programming paradigm point of view, we can adopt one of two views to help us describe the world and formulate operations within it. Either, everything is an object with internal states — attributes — which can be created, modified, or destroyed, and with internal functions — methods — that operate on these attributes. Alternatively, everything is either a function or a datum (plural: data), which have no internal states. Functions operate on data, and data can only be created, modified, or destroyed by being processed through a function.

**Entropy.** Second Law of Thermodynamics, which states that in a closed system, a measure called entropy always increases over time. This quantity can be related to the measure of disorder within the system. Being a universal law of Nature, it applies to states of computation as well, although there we have more freedom in controlling it. We can achieve an almost permanent state of order within a computer's computational state by dumping its entropy through a cooling fan into the outside world. To simulate the real world, entropy needs to be manually reintroduced into the computational state, over which we hold control.

**State of equilibrium.** In a closed system, matter, energy, and information are conserved. The world is a closed system. Newton's Third Law states that "for every action, there is an equal and opposite reaction." The world is composed of opposites, between which there is tension. Opposites create tension, and tension destroys opposites by making them identical (non-opposites), thereby releasing the tension. Given enough time, all tension will be released, opposites will be destroyed, and everything will become the same. This is called the State of Equilibrium. The number of such states is potentially infinite. All natural phenomena can be described as either states of equilibrium or states striving to reach it.

**Discrete time and space.** Although time is continuous, in terms of computation, we can regard it as discrete. By choosing a sufficiently small interval, we can achieve a reasonable approximation of reality. Due to their hardware, which consists of discrete calculating units, computers cannot work with continuous quantities, only discrete ones. We can discretize time to simulate reality within a computer, choosing a time interval as small as necessary (but not zero or infinitesimal) to achieve an approximation with arbitrary precision. While the discretized reality will not be perfect, it can still be very useful. In the digital realm, space is also discretized. The precision of this discretization depends on the precision of the numbers a computer can represent. As with time, when made sufficiently small, this discretization becomes indistinguishable from the physical world. Ultimately, granularity of these two discretizations sets limits to the computational state and helps uncover its digital nature.

### Conclusion

In the eyes of the general public, generative art might seem like a very new field, yet it builds on more than half a century of tradition in computer art. Writing code is like writing in a common language that we share with machines — an almost inhuman task. You might even be forgiven for mistaking the artists presented in this book for wizards or sorcerers, speaking in what seems like an arcane language. To be an artist often means standing apart, and to be an artist who codes can feel even more isolating. It takes a certain level of bravery to adopt a form of expression that is so often misunderstood, at the intersection of multiple fields and domains of knowledge. My goal as a generative artist is to seek understanding, not so much of myself (for we are all the same, maybe even one), but of the world which we inhabit and ultimately embody.

### Appendix — material removed from the published version

The draft also contained the following sections, marked by the author as "NOT NEEDED PARTS" and removed from the intended published contribution. They are preserved here as source material for the principles distilled in [`principles.md`](principles.md).

**Computational design.** Many terms — digital, computational, and algorithmic — have been used to describe the role of computers in design. As professionals began applying computers in design, different approaches naturally emerged, leading to terms like digital design, computational design, algorithmic design, and parametric design. Unfortunately, these terms often remained vague and ambiguous, with many overlaps.

*Digital design* implies the use of computer tools in the design process. Defined this way, digital design is an extremely broad term and therefore not very useful in everyday practice or professional discourse. It is often used by graphic designers to distinguish those who work purely in digital media, such as interface and web design. For other designers, it is less useful because, in the 21st century, almost all design work involves some use of computers. More generally, digital design can be understood as using computers for drafting or other representational purposes.

*Computational design* implies the use of computation in the design process, which can be done through both digital and analog mediums, with the latter being referred to as analog computation. Computational design is a process that takes advantage of a medium's computational capabilities, such as generating, informing, or steering the design through algorithmic or computation-based procedures. These procedures include automation, deduction, induction, abstraction, parallel processing, propagation, and feedback.

It is possible to have computational design without the use of digital tools, and to use digital tools without relying on computational design. This fact establishes an orthogonal relationship between computational design and digital design. For example, form-finding using physical minimal surface experiments is a type of computational design that is not digital, while using a CAD tool merely for drafting is an example of digital design that is not computational.

Computational design implies *computational thinking*, which involves problem-solving methods that express problems and their solutions in ways that a computer can execute. It involves the mental skills and practices required to design computations that direct computers to perform desired tasks. It also includes explaining and interpreting the world as a complex system of information processes that can be analyzed and utilized through computation.

The characteristics that define computational thinking are decomposition, pattern recognition, data representation, generalization, abstraction, and algorithms. By decomposing a problem, identifying relevant variables through data representation, and creating algorithms, a generic solution can be formulated. This solution is a generalization or abstraction that can be used to solve multiple variations of the original problem.

**Architects, drawings and computers.** Since the Renaissance and Leon Battista Alberti's book *De re aedificatoria* from 1452, the architect has been defined as the author of a building, based solely on the deliberate act of drawing up the design. The act of drawing itself became not only a claim of authorship but also an indispensable design tool for centuries to come. To build was to draw, and without a prior drawing, no building could be executed. Drawing became synonymous with design, and design became synonymous with the building itself.

This rather simplified viewpoint neglected the complexities of large-scale building endeavors, whether it was a cathedral, aqueduct, palace, or urban fortifications. In the idealistic, individual-centered philosophy of the Renaissance, only the design mattered, and the design was envisioned by a single creative mind through the act of drawing. This position was further strengthened after the invention of the printing press in the late 15th century, shortly after Alberti published his book. Now, drawings and the designs they represented could be reliably reproduced and distributed to the masses.

In the 21st century, computers have become ubiquitous tools for designers and architects. In design work, they can act as digital stand-ins for traditional drawing implements used for centuries: rulers, compasses, protractors, and pantographs. However, computers offer us much more than these. Their built-in Von Neumann architecture processes data as well as the code instructions that operate on that data. Alongside the invention of the calculating machine, we developed formal languages to communicate with computers.

For the first time in history, we invented languages specifically to interact with machines. This allows us to use computers not only as drawing tools but as programmable drawing agents themselves. This "agency" of the computer enables us to explore designs that were previously exclusive to nature itself.

**Principles of computation (longer formulations).** The draft also contained a longer set of principles ("Rules rule the world", "Object-oriented world view", "Function-oriented world view", "Principle of opposites", "Nature/culture dichotomy", "State of equilibrium", "Entropy", "Discrete time", "Discrete space"), distilled into [`principles.md`](principles.md).

---

## 2023 — Generative Architecture: Q&A

- **Year**: 2023 (June)
- **Format**: Interview / journal answers
- **Venue**: Verse Works journal — *Generative Architecture: Questions and Answers with Artists & Curators*
- **URL**: <https://verse.works/journal/generative-architecture-questions-and-answers-with-artists-curators>
- **Source document**: `source documents/230611_GenerativeArchitecture_JournalAnswers.docx`

> Q: How does the notion of 'a room' resonate with you in the context of the exhibition concept?

Interestingly, in 2014 we organized a student workshop titled "Zagreb Rooms" with colleagues from ETH Zürich. Architecture students were tasked to study, analyze and ultimately draw certain urban areas in the city of Zagreb, but to look at them as "urban rooms", separated spaces with clearly defined contact points to their immediate context. In this way, if an urban neighborhood is seen as a room, then the city becomes a building, county in turn becomes a neighborhood etc. This shifting of scales gives a completely different starting point to critically observe your environment, which is reflected in how the drawings themselves were designed. For example, a graveyard became "The Continent", an informal neighborhood with single family houses and gardens became "The Island" etc. So, when I heard about the title of the exhibition that the curators have chosen, it brought back some of those playful explorations to mind and I was very excited to approach this topic again.

> Q: Do you think virtual spaces like Twitter spaces, Discord etc. can be seen as architectural entities, and if so what is the role of the architect in them?

It is sometimes hard for architects to speak about the "space", as it's so central to our profession, yet so vague as well. In the 19th century, every decent European city had Caffe Central or something similar, where people from all walks of life would meet and discuss current topics of the day, including politics, art, local gossip etc. Ancient Romans had Forum Romanum, ancient Greeks their Agora, all of which served the same purpose, to meet and to exchange. Today, this societal role is filled by online platforms. Difference is that the former were designed by architects and urban planners, the latter ones by UIX designers. I don't find this tragic at all, but it does show how our role in society has shifted.

> Q: And what do you think the future role of architects in the digital space entails?

Traditionally, architects are seen as designers of buildings or in general, of organizing spatial functions. In the future, if our profession is to survive (which is far from certain) we must shift our focus towards designing "organization" in a more general sense. This is something where we already excel, organization of complex processes, because constructing a building is a very complex process. This, coupled with computational and algorithmic thinking, is something where we could contribute in the future, and this is even more relevant in the digital realm. In a way, generative architects are handling this type of complexity in their work, where we are no longer designing a single object but an entire collection, hundreds of variations at the same time. Design itself happens in the digital realm, all these variations exist and are at the same time evaluated there, they in fact never leave it. Most traditional architects don't understand this, but spatial problems we need to tackle in the 21st century cannot be solved with 20th century tools, methods of creation or thinking.

> Q: In what ways do architecture and generative art overlap, and how do you leverage this intersection in your work?

As I mentioned before, generative architects don't design single objects, but entire collections. Well, technically we design an algorithm which can be used to generate infinite variations, from which we afterwards make a selection. In my professional life, there was always this imperative to create automatic evaluation tools, optimization procedures, which would select the best designs from the ones that are created by the generator. The difference in the art world is that the focus is not on optimization, as the goal is not to find the "best" design, rather it is to create a well-rounded, diverse and varied collection. It is incredible how liberating this is, letting go of this need to produce and to justify one single design, and to focus on the entire collection where every piece is valued in its own way. In the gen art community, we are having many discussions regarding this, pros and cons of traditional (random) long-form and collector curated collections, who gets to choose which pieces should be included in the collection, the artist, the algorithm, or the collector?

> Q: Now that you've entered the digital space, how has it extended your creative network?

Personally, as someone who spent a lot of years in academia, hanging out on gen art platforms, Twitter and Discord channels has greatly expanded my professional network. I've (virtually) met so many smart and talented people and had a chance to collaborate with them on real projects and collections. I understand this is still just a subset of all the people that are out there, but perhaps exactly because of the recent pandemic, many people were forced to shift from in-person interactions to virtual ones. I guess there are many ways people can spend their time online, and most of them are rather unproductive, but for me, it has been very positive, this confluence of technology, art and talent. One conscious decision I've made is to nurture this, not let it go to waste, to focus and to channel it, and hopefully expand in the future. Even with our architecture office TEN Studio we've adopted this remote way of working even before the pandemic.

> Q: Has the use of generative art enabled you to explore new possibilities and push the boundaries of traditional architectural design?

I've been teaching digital fabrication, computational design and algorithmic thinking at the university level for 12 years now. Every year we do one or two design studios with the students where we try to develop architectural designs using these "novel" tools. And every year, we struggle to improve on the already existing design methods. This is a very complex topic, but my summary would be: just because you're using a more complex tool, it doesn't mean the problem just got easier to solve. Many problems in architecture are like that, we call them "wicked" problems, which evade easy solutions. Still, there are many areas that can be greatly improved by using, for example, code-based approach to design. For traditional architects, using code can be seen as a superpower. Maybe that's the reason why there are not more generative architects out there making art, they all got gobbled up by architecture offices and are kept there on high payrolls.

> Q: How your specific practice as an architect has brought you to generative art?

Oh, as I mentioned already, I've been teaching coding to architects for over a decade now. So, for me, the transition to generative art was a logical step and a great pleasure. There was a short period where I had to learn different frameworks in order to be able to operate in this field, but the type of algorithmic thinking and of course the logic of programming is the same. Even more, my previous experience as an architect has made me more comfortable working with 3D compositions, complex geometries, animations and interactivity, which reflects in my work.

> Q: Rooms are things we take from ecosystems. They're features of buildings, which are themselves constructed on captures of portions of territory where there used to be life. Isn't the practice of giving such power to algorithms a dangerous one? None of the rooms in this exhibition will be built. But some could. And the algorithms are "in the world" now. How do we make generative architecture a non-destructive practice?

Well, I will just say that the whole history of human civilization has been a story of conflict between our species and the environment. It's just that when we were just a tiny part of the ecosystem it didn't matter, but now it does. We can talk about sustainability all we want, but there we are really talking about our sustainability as a species, not of our environment. The environment is already being consumed, there is no way to avoid this, as we as a species need space and resources, both of which are finite. Generative architecture, if it really proliferates into something outside of the digital realm, will be just a small "bleep" in that historical development.

> Q: You defined rules for algorithms to build rooms. What are they for? What did you intend to happen in those rooms?

*(Not answered in the source document.)*

---

## External articles, interviews and features (links)

A working list of external publications about Luka Piškorec / {protocell:labs} or authored by him for fxhash and similar venues. Format and any inline reproduction to be decided later — for now, links only.

### 2024 — TECTONICA by {protocell:labs}

- **Venue**: The Culture Project (Substack)
- **URL**: <https://thecultureproject.substack.com/p/tectonica-by-protocelllabs>
- **Related work**: *TECTONICA* — see [`generative-collections.md`](generative-collections.md).

### 2023 — Glitchverse: Interview with Jarid Scott and Luka Piškorec

- **Author**: Brady Evan Walker
- **Venue**: Paragraph (originally published on Mirror.xyz)
- **URL**: <https://paragraph.com/@sgtslaughtermelon/glitchverse-interview-with-jarid-scott-and-luka-pi-korec-by-brady-evan-walker>
- **Related work**: *Glitchverse* (`ǥᵍłˡŧᵗȼᶜħʰvᵛɍʳsˢ`) — see [`generative-collections.md`](generative-collections.md).

### 2023 — rtrdgtzr — Minter's Guide

- **Author**: Luka Piškorec / {protocell:labs}
- **Venue**: fxhash
- **URL**: <https://www.fxhash.xyz/article/rtrdgtzr-minter's-guide>
- **Related work**: *rtrdgtzr* — see [`generative-collections.md`](generative-collections.md).

### 2023 — Generative Architecture: Questions and Answers with Artists & Curators

- **Venue**: Verse Works journal
- **URL**: <https://verse.works/journal/generative-architecture-questions-and-answers-with-artists-curators>
- **Note**: Full Q&A text reproduced above in this document.

### 2022 — O B S C V R V M — Algorithms and Code

- **Author**: Luka Piškorec / {protocell:labs}
- **Venue**: fxhash
- **URL**: <https://www.fxhash.xyz/article/o-b-s-c-v-r-v-m-algorithms-and-code>
- **Related work**: *OBSCVRVM* — see [`generative-collections.md`](generative-collections.md).
