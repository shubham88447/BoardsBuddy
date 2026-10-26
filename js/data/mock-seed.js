/**
 * BoardsBuddy - Mock Seed Data & Offline Fallback Dataset
 * Mirrors the Supabase PostgreSQL database tables exactly.
 */

const MOCK_BOARDS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Maharashtra State Board',
    code: 'MSBSHSE',
    description: 'Maharashtra State Board of Secondary and Higher Secondary Education (SSC)',
    is_active: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'CBSE',
    code: 'CBSE',
    description: 'Central Board of Secondary Education (Content coming soon)',
    is_active: false
  }
];

const MOCK_CLASSES = [
  {
    id: '33333333-3333-3333-3333-333333333333',
    board_id: '11111111-1111-1111-1111-111111111111',
    name: 'Class 10 (SSC)',
    code: '10',
    is_active: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    board_id: '11111111-1111-1111-1111-111111111111',
    name: 'Class 9',
    code: '9',
    is_active: false
  }
];

const MOCK_SUBJECTS = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    name: 'Mathematics Part 1 (Algebra)',
    code: 'MATH1',
    icon: 'calculator',
    color: '#4f46e5',
    description: 'Linear Equations, Quadratic Equations, Arithmetic Progression, Financial Planning, Probability & Statistics.',
    is_active: true,
    display_order: 1
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    name: 'Mathematics Part 2 (Geometry)',
    code: 'MATH2',
    icon: 'shapes',
    color: '#0891b2',
    description: 'Similarity, Pythagoras Theorem, Circle, Geometric Constructions, Coordinate Geometry, Trigonometry, Mensuration.',
    is_active: true,
    display_order: 2
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    name: 'Science & Technology Part 1',
    code: 'SCI1',
    icon: 'atom',
    color: '#2563eb',
    description: 'Physics and Chemistry: Gravitation, Periodic Classification, Chemical Reactions, Electric Current, Heat, Lenses.',
    is_active: true,
    display_order: 3
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    name: 'Science & Technology Part 2',
    code: 'SCI2',
    icon: 'dna',
    color: '#059669',
    description: 'Biology and Environmental Science: Heredity, Life Processes, Environmental Management, Biotechnology.',
    is_active: true,
    display_order: 4
  }
];

const MOCK_CHAPTERS = [
  // Mathematics Part 1
  {
    id: 'c1010000-0000-0000-0000-000000000001',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 1,
    title: 'Linear Equations in Two Variables',
    description: 'Simultaneous equations, Graphical method, Cramer\'s rule, and application problems.',
    display_order: 1,
    is_active: true
  },
  {
    id: 'c1010000-0000-0000-0000-000000000002',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 2,
    title: 'Quadratic Equations',
    description: 'Standard form, Factorization, Formula method, Discriminant, Nature of roots.',
    display_order: 2,
    is_active: true
  },
  {
    id: 'c1010000-0000-0000-0000-000000000003',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 3,
    title: 'Arithmetic Progression',
    description: 'Sequence, nth term of an A.P., Sum of first n terms, Word problems.',
    display_order: 3,
    is_active: true
  },
  {
    id: 'c1010000-0000-0000-0000-000000000004',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 4,
    title: 'Financial Planning',
    description: 'GST, CGST, SGST, Tax invoice, Share market, Mutual funds, SIP.',
    display_order: 4,
    is_active: true
  },
  {
    id: 'c1010000-0000-0000-0000-000000000005',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 5,
    title: 'Probability',
    description: 'Random experiments, Sample space, Events, Probability of an event.',
    display_order: 5,
    is_active: true
  },
  {
    id: 'c1010000-0000-0000-0000-000000000006',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_number: 6,
    title: 'Statistics',
    description: 'Mean, Median, Mode, Histogram, Frequency polygon, Pie diagram.',
    display_order: 6,
    is_active: true
  },

  // Mathematics Part 2
  {
    id: 'c2010000-0000-0000-0000-000000000001',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 1,
    title: 'Similarity',
    description: 'Ratio of areas of two triangles, Basic Proportionality Theorem, Tests of similarity.',
    display_order: 1,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000002',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 2,
    title: 'Pythagoras Theorem',
    description: 'Geometric mean theorem, Pythagoras theorem proof and converse, Apollonius theorem.',
    display_order: 2,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000003',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 3,
    title: 'Circle',
    description: 'Tangent theorem, Inscribed angle theorem, Cyclic quadrilateral, Tangent-secant theorem.',
    display_order: 3,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000004',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 4,
    title: 'Geometric Constructions',
    description: 'Construction of similar triangles, Construction of tangents to a circle.',
    display_order: 4,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000005',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 5,
    title: 'Coordinate Geometry',
    description: 'Distance formula, Section formula, Midpoint formula, Slope of a line.',
    display_order: 5,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000006',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 6,
    title: 'Trigonometry',
    description: 'Trigonometric ratios, Identities, Heights and Distances with elevation and depression.',
    display_order: 6,
    is_active: true
  },
  {
    id: 'c2010000-0000-0000-0000-000000000007',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_number: 7,
    title: 'Mensuration',
    description: 'Area and volume of cylinder, cone, sphere, frustum, sector of circle.',
    display_order: 7,
    is_active: true
  },

  // Science & Technology Part 1
  {
    id: 'c3010000-0000-0000-0000-000000000001',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 1,
    title: 'Gravitation',
    description: 'Kepler\'s laws, Newton\'s universal law of gravitation, Acceleration due to gravity (g), Free fall, Escape velocity.',
    display_order: 1,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000002',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 2,
    title: 'Periodic Classification of Elements',
    description: 'Dobereiner\'s Triads, Newlands\' Octaves, Mendeleev\'s Table, Modern Periodic Table, Periodic trends.',
    display_order: 2,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000003',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 3,
    title: 'Chemical Reactions and Equations',
    description: 'Types of chemical reactions, Balancing equations, Oxidation and reduction, Corrosion.',
    display_order: 3,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000004',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 4,
    title: 'Effects of Electric Current',
    description: 'Heating effect, Joule\'s law, Magnetic effect, Right hand thumb rule, Fleming\'s rules, Electric motor & generator.',
    display_order: 4,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000005',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 5,
    title: 'Heat',
    description: 'Latent heat, Anomalous behavior of water, Dew point, Humidity, Specific heat capacity.',
    display_order: 5,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000006',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 6,
    title: 'Refraction of Light',
    description: 'Laws of refraction, Refractive index, Total internal reflection, Mirage, Twinkling of stars.',
    display_order: 6,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000007',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 7,
    title: 'Lenses',
    description: 'Convex & concave lenses, Ray diagrams, Lens formula, Magnification, Power of lens, Human eye defects.',
    display_order: 7,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000008',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 8,
    title: 'Metallurgy',
    description: 'Properties of metals/non-metals, Reactivity series, Extraction of metals, Corrosion prevention.',
    display_order: 8,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000009',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 9,
    title: 'Carbon Compounds',
    description: 'Covalent bonds, Hydrocarbons, Functional groups, Homologous series, Nomenclature, Reactions.',
    display_order: 9,
    is_active: true
  },
  {
    id: 'c3010000-0000-0000-0000-000000000010',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_number: 10,
    title: 'Space Missions',
    description: 'Artificial satellites, Satellite orbits, Satellite launch vehicles, Moon/Mars missions, Space debris.',
    display_order: 10,
    is_active: true
  },

  // Science & Technology Part 2
  {
    id: 'c4010000-0000-0000-0000-000000000001',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_number: 1,
    title: 'Heredity and Evolution',
    description: 'Transcription, Translation, Translocation, Evolution, Evidences of evolution, Darwin & Lamarckism, Human evolution.',
    display_order: 1,
    is_active: true
  },
  {
    id: 'c4010000-0000-0000-0000-000000000002',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_number: 2,
    title: 'Life Processes in Living Organisms Part 1',
    description: 'Cellular respiration (Glycolysis, Krebs cycle, ETC), Energy from nutrients, Cell division (Mitosis & Meiosis).',
    display_order: 2,
    is_active: true
  },
  {
    id: 'c4010000-0000-0000-0000-000000000003',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_number: 3,
    title: 'Life Processes in Living Organisms Part 2',
    description: 'Asexual & sexual reproduction, Human reproductive system, Menstrual cycle, Reproductive health.',
    display_order: 3,
    is_active: true
  },
  {
    id: 'c4010000-0000-0000-0000-000000000004',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_number: 4,
    title: 'Environmental Management',
    description: 'Ecosystem, Environmental conservation & biodiversity, Hotspots, Sacred groves, Disaster management.',
    display_order: 4,
    is_active: true
  },
  {
    id: 'c4010000-0000-0000-0000-000000000005',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_number: 5,
    title: 'Towards Green Energy',
    description: 'Energy generation from thermal, nuclear, solar, hydro, wind; Environmental impacts and green energy solutions.',
    display_order: 5,
    is_active: true
  }
];

const MOCK_RESOURCES = [
  // 1. Textbooks
  {
    id: 'r-tb-1',
    type: 'textbook',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: null,
    title: 'Mathematics Part 1 (Algebra) - Official Textbook',
    description: 'Maharashtra State Bureau of Textbook Production and Curriculum Research, Balbharati official Class 10 textbook.',
    file_url: 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020101.pdf',
    external_url: 'https://ebalbharati.in',
    content_text: 'Official eBalbharati textbook for Mathematics Part 1 (Class 10 SSC). All 6 chapters included with practice problem sets and answer keys.',
    year: 2024,
    marks: null,
    topic: 'Full Syllabus',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'r-tb-2',
    type: 'textbook',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a2222222-2222-2222-2222-222222222222',
    chapter_id: null,
    title: 'Mathematics Part 2 (Geometry) - Official Textbook',
    description: 'Official Balbharati Class 10 Geometry textbook covering all 7 chapters with proofs and practice sets.',
    file_url: 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020102.pdf',
    external_url: 'https://ebalbharati.in',
    content_text: 'Official Balbharati Class 10 Geometry textbook covering Similarity, Pythagoras theorem, Circle, Coordinate Geometry, and Trigonometry.',
    year: 2024,
    marks: null,
    topic: 'Full Syllabus',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'r-tb-3',
    type: 'textbook',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_id: null,
    title: 'Science & Technology Part 1 - Official Textbook',
    description: 'Physics & Chemistry textbook by Balbharati covering 10 chapters, diagrams, and experiments.',
    file_url: 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020103.pdf',
    external_url: 'https://ebalbharati.in',
    content_text: 'Comprehensive textbook covering Gravitation, Modern Periodic Table, Chemical Reactions, Electric Current, Heat, Lenses, and Space Missions.',
    year: 2024,
    marks: null,
    topic: 'Full Syllabus',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'r-tb-4',
    type: 'textbook',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_id: null,
    title: 'Science & Technology Part 2 - Official Textbook',
    description: 'Biology & Environmental Management textbook by Balbharati with labeled figures and review questions.',
    file_url: 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020104.pdf',
    external_url: 'https://ebalbharati.in',
    content_text: 'Life Sciences textbook detailing cellular biology, genetics, ecosystem conservation, and biotechnology.',
    year: 2024,
    marks: null,
    topic: 'Full Syllabus',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-10T10:00:00Z'
  },

  // 2. Comprehensive Notes
  {
    id: 'r-notes-1',
    type: 'notes',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000001',
    title: 'Comprehensive Notes: Linear Equations in Two Variables',
    description: 'Detailed theoretical concepts, Cramer\'s rule derivations, elimination method steps, and solved examples for Board Exams.',
    file_url: null,
    external_url: null,
    content_text: `## Chapter 1: Linear Equations in Two Variables

### 1. Definition & Standard Form
An equation which contains two variables and the degree of each term containing variable is **one** is called a **Linear Equation in Two Variables**.

**General Form:**
$$ax + by + c = 0$$
where $a, b, c$ are real numbers and $a \\neq 0, b \\neq 0$ simultaneously.

#### Examples to Test for Linear Equations:
- $4x + 3y = 12$ $\\rightarrow$ Linear Equation (degree of both $x$ and $y$ is 1).
- $3x^2 - 7y = 13$ $\\rightarrow$ **NOT** linear (degree of $x$ is 2).
- $\\sqrt{2}x - \\sqrt{5}y = 16$ $\\rightarrow$ Linear Equation (coefficients can be irrational).
- $\\frac{4}{x} + \\frac{5}{y} = 7$ $\\rightarrow$ Can be converted into linear equations by substituting $1/x = m$ and $1/y = n$.

---

### 2. Methods of Solving Simultaneous Linear Equations

#### Method 1: Elimination by Equating Coefficients
1. Choose the variable you wish to eliminate.
2. Multiply one or both equations by appropriate non-zero numbers so that the coefficients of the selected variable become equal or opposite.
3. Add the equations (if signs are opposite) or subtract them (if signs are identical) to eliminate that variable.
4. Solve the resulting single-variable linear equation.
5. Substitute the obtained value into any of the original equations to solve for the second variable.

#### Method 2: Determinant Method (Cramer's Rule)
For a system of linear equations in standard form:
$$a_1x + b_1y = c_1$$
$$a_2x + b_2y = c_2$$

1. Calculate the Main Determinant $D$:
   $$D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix} = a_1b_2 - a_2b_1$$

2. Calculate Determinant with respect to $x$ ($D_x$):
   $$D_x = \\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix} = c_1b_2 - c_2b_1$$

3. Calculate Determinant with respect to $y$ ($D_y$):
   $$D_y = \\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix} = a_1c_2 - a_2c_1$$

4. According to Cramer's Rule:
   $$x = \\frac{D_x}{D} \\quad \\text{and} \\quad y = \\frac{D_y}{D} \\quad (\\text{provided } D \\neq 0)$$

---

### 3. Nature of Solutions & Consistency Criteria
- If $\\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}$: The pair of equations has a **unique solution** (lines intersect at exactly one point).
- If $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}$: The pair of equations has **infinitely many solutions** (lines are coincident).
- If $\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}$: The pair has **no solution** (lines are parallel).`,
    year: null,
    marks: null,
    topic: 'Theory & Methods',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-12T10:00:00Z'
  },
  {
    id: 'r-notes-2',
    type: 'notes',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_id: 'c3010000-0000-0000-0000-000000000001',
    title: 'Comprehensive Notes: Gravitation',
    description: 'Kepler\'s Three Laws, Newton\'s Law of Gravitation, value of g at different altitudes, free fall equations and escape velocity.',
    file_url: null,
    external_url: null,
    content_text: `## Chapter 1: Gravitation

### 1. Introduction to Gravitation
The phenomenon of gravitation was discovered by Sir Isaac Newton. Gravity is a universal force that acts not only between two objects on Earth, but also between any two cosmic bodies in the universe.

### 2. Kepler's Three Laws of Planetary Motion
Johannes Kepler analyzed Tycho Brahe's astronomical observations and formulated three empirical laws:

#### Kepler's First Law (Law of Orbits):
> *The orbit of a planet is an ellipse with the Sun at one of the foci.*

#### Kepler's Second Law (Law of Areas):
> *The line joining the planet and the Sun sweeps equal areas in equal intervals of time.*
- Consequently, when a planet is closer to the Sun (perihelion), it moves faster than when it is farther away (aphelion).

#### Kepler's Third Law (Law of Periods):
> *The square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of a planet from the Sun.*
$$T^2 \\propto r^3 \\implies \\frac{T^2}{r^3} = \\text{Constant } (K)$$

---

### 3. Newton's Universal Law of Gravitation
Every object in the universe attracts every other object with a force that is:
1. Directly proportional to the product of their masses ($m_1 \\cdot m_2$)
2. Inversely proportional to the square of the distance between them ($r^2$)

$$F = G \\cdot \\frac{m_1 m_2}{r^2}$$

- $G$ is called the **Universal Gravitational Constant**.
- Experimental value of $G = 6.673 \\times 10^{-11} \\text{ N}\\cdot\\text{m}^2/\\text{kg}^2$.
- S.I. unit of $G$: $\\text{N}\\cdot\\text{m}^2/\\text{kg}^2$.

---

### 4. Acceleration Due to Gravity ($g$)
$$g = \\frac{G \\cdot M}{R^2}$$
On Earth's surface:
- At Poles: $g = 9.832 \\text{ m/s}^2$ (Earth is flattened at poles, smaller radius $R$).
- At Equator: $g = 9.78 \\text{ m/s}^2$ (Earth bulges at equator, larger radius $R$).
- Standard average value used in calculations: $g = 9.8 \\text{ m/s}^2$.`,
    year: null,
    marks: null,
    topic: 'Gravitation & Kepler Laws',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-12T10:00:00Z'
  },

  // 3. Short Notes (Formula Sheets & Fast Revision)
  {
    id: 'r-sn-1',
    type: 'short_notes',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000001',
    title: '⚡ Fast Revision & Formula Sheet: Linear Equations',
    description: 'Key formulas, determinant expansion shortcuts, and rapid examination tips for Class 10 Board Exams.',
    file_url: null,
    external_url: null,
    content_text: `### ⚡ Formula & Cheat Sheet: Linear Equations

| Concept | Key Equation / Rule | Board Exam Weightage |
|---|---|---|
| **Standard Form** | $ax + by + c = 0$ ($a, b \\neq 0$) | 1 Mark MCQ |
| **Determinant Value** | $D = a_1b_2 - a_2b_1$ | 1 Mark |
| **Cramer's Formula** | $x = D_x / D$, $y = D_y / D$ | 3 - 4 Marks |
| **Intersecting Lines** | $a_1/a_2 \\neq b_1/b_2$ (Unique Solution) | 1 - 2 Marks |
| **Coincident Lines** | $a_1/a_2 = b_1/b_2 = c_1/c_2$ (Infinite Solutions) | 1 - 2 Marks |
| **Parallel Lines** | $a_1/a_2 = b_1/b_2 \\neq c_1/c_2$ (No Solution) | 1 - 2 Marks |

#### 💡 Board Exam Pro-Tip:
For equations like:
$$15x + 17y = 21$$
$$17x + 15y = 11$$
Where coefficients of $x$ and $y$ are interchanged, **never use substitution directly!**
1. Add equations once $\\rightarrow 32x + 32y = 32 \\implies x + y = 1$
2. Subtract equations once $\\rightarrow -2x + 2y = 10 \\implies -x + y = 5$
3. Adding these two gives $2y = 6 \\implies y = 3, x = -2$ in 20 seconds!`,
    year: null,
    marks: null,
    topic: 'Formula Sheet',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'r-sn-2',
    type: 'short_notes',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000002',
    title: '⚡ Fast Revision & Formula Sheet: Quadratic Equations',
    description: 'Quadratic formula, discriminant nature of roots table, and formula to construct a quadratic equation.',
    file_url: null,
    external_url: null,
    content_text: `### ⚡ Formula & Cheat Sheet: Quadratic Equations

#### 1. Standard Form:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

#### 2. Quadratic Formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### 3. Nature of Roots (Discriminant $\\Delta = b^2 - 4ac$):
- If $\\Delta > 0$: Roots are **Real and Unequal**.
- If $\\Delta = 0$: Roots are **Real and Equal** ($x = -b / 2a$).
- If $\\Delta < 0$: Roots are **Not Real** (No real roots).

#### 4. Relations with Roots $\\alpha$ and $\\beta$:
- **Sum of roots:** $\\alpha + \\beta = -\\frac{b}{a}$
- **Product of roots:** $\\alpha \\cdot \\beta = \\frac{c}{a}$
- **Construct quadratic equation:** $x^2 - (\\alpha + \\beta)x + (\\alpha \\beta) = 0$`,
    year: null,
    marks: null,
    topic: 'Formula Sheet',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-15T10:00:00Z'
  },

  // 4. PYQs (Year-wise Question Papers)
  {
    id: 'r-pyq-1',
    type: 'pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: null,
    title: 'Mathematics Part 1 (Algebra) - March 2024 Question Paper',
    description: 'Official Maharashtra Board SSC March 2024 Examination Paper. Total Marks: 40. Time: 2 Hours.',
    file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    external_url: null,
    content_text: `**MAHARASHTRA STATE BOARD SSC EXAMINATION MARCH 2024**
**Subject:** Mathematics Part 1 (Algebra)
**Max Marks:** 40 | **Time:** 2 Hours

**Instructions:**
1. All questions are compulsory.
2. Use of calculator is not permitted.
3. The numbers to the right of the questions indicate full marks.

---

### Q.1 (A) Four alternative answers are given for every subquestion. Choose correct alternative: [4 Marks]
1. For simultaneous equations in variables $x$ and $y$, if $D_x = 49$, $D_y = -63$, $D = 7$, then what is $x$?
   (A) 9   (B) 7   (C) -7   (D) -9
2. Which of the following is a quadratic equation?
   (A) $x^3 - 3x = 12$   (B) $x + 2/x = x^2$   (C) $x(x + 5) = 2$   (D) $n - 1 = 2n$

### Q.1 (B) Solve the following subquestions: [4 Marks]
1. Find the value of determinant $\\begin{vmatrix} 3 & -2 \\\\ 4 & 5 \\end{vmatrix}$.
2. For an A.P., if $a = 3.5$, $d = 0$, $n = 101$, then find $t_n$.`,
    year: 2024,
    marks: 40,
    topic: 'Board Exam Paper',
    is_published: true,
    allow_download: true,
    created_at: '2024-03-20T10:00:00Z'
  },
  {
    id: 'r-pyq-2',
    type: 'pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: null,
    title: 'Mathematics Part 1 (Algebra) - March 2023 Question Paper',
    description: 'Official SSC Board Question Paper with complete sections Q.1(A) to Q.5. Total Marks: 40.',
    file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    external_url: null,
    content_text: `**MAHARASHTRA STATE BOARD SSC EXAMINATION MARCH 2023**
**Subject:** Mathematics Part 1 (Algebra)
**Max Marks:** 40 | **Time:** 2 Hours

Complete original paper with word problems on Linear Equations, Quadratic Formula, Arithmetic Progression word problems, and Statistics frequency polygons.`,
    year: 2023,
    marks: 40,
    topic: 'Board Exam Paper',
    is_published: true,
    allow_download: true,
    created_at: '2023-03-20T10:00:00Z'
  },
  {
    id: 'r-pyq-3',
    type: 'pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_id: null,
    title: 'Science & Technology Part 1 - March 2024 Question Paper',
    description: 'Official SSC Board March 2024 Physics & Chemistry paper with MCQs, conceptual questions and numericals.',
    file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    external_url: null,
    content_text: `**MAHARASHTRA STATE BOARD SSC EXAMINATION MARCH 2024**
**Subject:** Science and Technology Part 1
**Max Marks:** 40 | **Time:** 2 Hours

**Section Highlights:**
- Gravitation numericals on escape velocity
- Modern Periodic Table group vs period properties
- Balancing redox reaction equations
- Electrical circuits and Fleming's left hand rule diagrams`,
    year: 2024,
    marks: 40,
    topic: 'Board Exam Paper',
    is_published: true,
    allow_download: true,
    created_at: '2024-03-20T10:00:00Z'
  },

  // 5. Chapterwise PYQs
  {
    id: 'r-cpyq-1',
    type: 'chapterwise_pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000001',
    title: 'Find the value of determinant: | 4  3 | / | 2  7 |',
    description: 'Direct determinant evaluation problem from SSC March 2023.',
    file_url: null,
    external_url: null,
    content_text: `**Question (1 Mark - March 2023):**
Find the value of the determinant:
$$D = \\begin{vmatrix} 4 & 3 \\\\ 2 & 7 \\end{vmatrix}$$`,
    year: 2023,
    marks: 1,
    topic: 'Determinants',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'r-cpyq-2',
    type: 'chapterwise_pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000001',
    title: 'Solve using Cramer\'s rule: 3x - 4y = 10, 4x + 3y = 5',
    description: 'Frequently asked 3-mark board question from SSC March 2024.',
    file_url: null,
    external_url: null,
    content_text: `**Question (3 Marks - March 2024):**
Solve the following simultaneous equations using Cramer's rule:
$$3x - 4y = 10$$
$$4x + 3y = 5$$`,
    year: 2024,
    marks: 3,
    topic: 'Cramer\'s Rule',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'r-cpyq-3',
    type: 'chapterwise_pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_id: 'c3010000-0000-0000-0000-000000000001',
    title: 'State Kepler\'s three laws of planetary motion with neat diagram.',
    description: 'High-frequency 3-mark theory question in Science 1 (2020, 2022, 2024).',
    file_url: null,
    external_url: null,
    content_text: `**Question (3 Marks - March 2024 & March 2022):**
State Kepler's three laws of planetary motion. Draw an elliptical orbit diagram showing the sun at one of the foci.`,
    year: 2024,
    marks: 3,
    topic: 'Kepler\'s Laws',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 'r-cpyq-4',
    type: 'chapterwise_pyq',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a4444444-4444-4444-4444-444444444444',
    chapter_id: 'c4010000-0000-0000-0000-000000000001',
    title: 'Explain the process of transcription, translation, and translocation with neat diagram.',
    description: 'Frequently asked 3-mark board exam question on genetics and protein synthesis from SSC March 2024.',
    file_url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    external_url: null,
    content_text: `**Question (3 Marks - March 2024):**
Explain the process of transcription, translation, and translocation with a neat schematic diagram.

**Model Answer:**
1. **Transcription:** The process of RNA synthesis from the DNA template is called transcription. During this process, mRNA is produced according to the sequence of nucleotides on DNA.
2. **Translation:** The mRNA brings codons from the nucleus to the cytoplasm. Each mRNA consists of thousands of triplet codons. tRNA molecules having complementary anticodons bring the required amino acids.
3. **Translocation:** The ribosome keeps on moving along the length of mRNA by a distance of one triplet codon. This movement is called translocation.`,
    year: 2024,
    marks: 3,
    topic: 'Protein Synthesis & Evolution',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-20T10:00:00Z'
  },

  // 6. PYQ Solutions
  {
    id: 'r-sol-1',
    type: 'pyq_solution',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a1111111-1111-1111-1111-111111111111',
    chapter_id: 'c1010000-0000-0000-0000-000000000001',
    title: 'Solution: Solve 3x - 4y = 10 and 4x + 3y = 5 using Cramer\'s Rule',
    description: 'Full step-by-step mathematical working with formula justification and final answer.',
    file_url: null,
    external_url: null,
    content_text: `### 📝 Problem:
Solve the simultaneous equations using Cramer's Rule:
1) $3x - 4y = 10$
2) $4x + 3y = 5$

---

### Step-by-Step Solution:

**Step 1: Write equations in standard form $ax + by = c$ and compare coefficients:**
- From equation (1): $a_1 = 3, \\quad b_1 = -4, \\quad c_1 = 10$
- From equation (2): $a_2 = 4, \\quad b_2 = 3, \\quad c_2 = 5$

**Step 2: Calculate Determinant $D$:**
$$D = \\begin{vmatrix} a_1 & b_1 \\\\ a_2 & b_2 \\end{vmatrix} = \\begin{vmatrix} 3 & -4 \\\\ 4 & 3 \\end{vmatrix}$$
$$D = (3 \\times 3) - (4 \\times -4)$$
$$D = 9 - (-16) = 9 + 16 = 25$$
*Since $D = 25 \\neq 0$, the system has a unique solution.*

**Step 3: Calculate Determinant $D_x$ (replace $x$-coefficients with constants $c$):**
$$D_x = \\begin{vmatrix} c_1 & b_1 \\\\ c_2 & b_2 \\end{vmatrix} = \\begin{vmatrix} 10 & -4 \\\\ 5 & 3 \\end{vmatrix}$$
$$D_x = (10 \\times 3) - (5 \\times -4)$$
$$D_x = 30 - (-20) = 30 + 20 = 50$$

**Step 4: Calculate Determinant $D_y$ (replace $y$-coefficients with constants $c$):**
$$D_y = \\begin{vmatrix} a_1 & c_1 \\\\ a_2 & c_2 \\end{vmatrix} = \\begin{vmatrix} 3 & 10 \\\\ 4 & 5 \\end{vmatrix}$$
$$D_y = (3 \\times 5) - (4 \\times 10)$$
$$D_y = 15 - 40 = -25$$

**Step 5: Apply Cramer's Rule Formula:**
$$x = \\frac{D_x}{D} = \\frac{50}{25} = 2$$
$$y = \\frac{D_y}{D} = \\frac{-25}{25} = -1$$

---

### ✅ Final Answer:
$$(x, y) = (2, -1) \\text{ is the solution of the given simultaneous equations.}$$`,
    year: 2024,
    marks: 3,
    topic: 'Cramer\'s Rule',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-22T10:00:00Z'
  },
  {
    id: 'r-sol-2',
    type: 'pyq_solution',
    board_id: '11111111-1111-1111-1111-111111111111',
    class_id: '33333333-3333-3333-3333-333333333333',
    subject_id: 'a3333333-3333-3333-3333-333333333333',
    chapter_id: 'c3010000-0000-0000-0000-000000000001',
    title: 'Solution: State Kepler\'s Three Laws of Planetary Motion',
    description: 'Model answer conforming to Maharashtra State Board evaluation scheme with mark distribution.',
    file_url: null,
    external_url: null,
    content_text: `### 📝 Problem:
State Kepler's three laws of planetary motion with relevant diagram and mathematical relations.

---

### Model Answer & Mark Breakdown:

#### 1. Kepler's First Law (Law of Orbits) [1 Mark]:
> *The orbit of a planet is an ellipse with the Sun located at one of the two foci.*
- The planetary path is not a perfect circle, but an elliptical trajectory where the distance between the planet and Sun varies throughout the orbit.

#### 2. Kepler's Second Law (Law of Areas) [1 Mark]:
> *The line segment joining the planet and the Sun sweeps out equal areas during equal intervals of time.*
- If a planet takes time $t$ to move from point $A$ to $B$, and the same time $t$ to move from $C$ to $D$:
  $$\\text{Area of Sector } ASB = \\text{Area of Sector } CSD$$
- **Physical Interpretation:** The planet speeds up when near the Sun and slows down when farther away.

#### 3. Kepler's Third Law (Law of Periods) [1 Mark]:
> *The square of the orbital period of revolution of a planet around the Sun is directly proportional to the cube of the mean distance of the planet from the Sun.*
- Mathematical formulation:
  $$T^2 \\propto r^3 \\implies \\frac{T^2}{r^3} = \\text{Constant } (K)$$
  Where $T$ is the period of revolution and $r$ is the semi-major axis (mean distance).

---

### ✅ Final Summary:
Kepler's three laws accurately established the kinematics of planetary motion and laid the mathematical foundation for Newton's formulation of the Universal Law of Gravitation ($F \\propto 1/r^2$).`,
    year: 2024,
    marks: 3,
    topic: 'Kepler\'s Laws',
    is_published: true,
    allow_download: true,
    created_at: '2024-01-22T10:00:00Z'
  }
];

window.BOARDSBUDDY_MOCK_DATA = {
  boards: MOCK_BOARDS,
  classes: MOCK_CLASSES,
  subjects: MOCK_SUBJECTS,
  chapters: MOCK_CHAPTERS,
  resources: MOCK_RESOURCES
};
