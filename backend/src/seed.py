"""Seed the Elysium Academy database with the course catalog, branches,
features, testimonials and a default admin account.

Run from the backend folder:  python -m src.seed
Idempotent: existing rows (matched by slug/email/title) are skipped.
"""

import json

from src import create_app, db
from src.models import (
    Admin,
    CourseCategory,
    Course,
    Branch,
    Testimonial,
    Feature,
    BlogPost,
    Award,
)
from src.utils.security import hash_password


DEFAULT_ADMIN = {
    "name": "Academy Admin",
    "email": "admin@elysiumacademy.org",
    "password": "Admin@123",
}


FEATURES = [
    ("Comprehensive Curriculum", "Industry-aligned syllabus covering fundamentals to advanced, real-world topics.", "book"),
    ("Real-World Projects", "Hands-on projects that mirror the work you'll do on the job.", "code"),
    ("Personalized Learning Paths", "Flexible tracks tailored to your goals and current skill level.", "route"),
    ("Updated Course Material", "Content refreshed continuously to match the latest tools and trends.", "refresh"),
    ("Dedicated Support Team", "Mentors and trainers available throughout your learning journey.", "support"),
    ("Networking Opportunities", "Connect with peers, alumni and hiring partners across the industry.", "users"),
    ("Seminars & Workshops", "Regular expert-led sessions, bootcamps and skill workshops.", "presentation"),
    ("Job Placement Assistance", "Resume building, mock interviews and placement drives with partners.", "briefcase"),
]


# category slug -> (name, icon, description, [courses])
# each course: (title, duration, level, tier, summary, [syllabus modules])
CATALOG = {
    "programming": {
        "name": "Programming Languages",
        "icon": "code",
        "description": "Core programming languages that form the foundation of any software career.",
        "courses": [
            ("Java Programming", "3 Months", "Beginner to Advanced", "classic",
             "Master object-oriented programming with Java, from syntax to enterprise patterns.",
             ["Java fundamentals & OOP", "Collections & Generics", "Exception handling", "JDBC & databases", "Multithreading", "Mini project"]),
            ("Python Programming", "3 Months", "Beginner to Advanced", "premium",
             "Learn Python for scripting, automation, web and data applications.",
             ["Python basics", "Data structures", "OOP in Python", "File & error handling", "Modules & packages", "Capstone project"]),
            ("C & C++ Programming", "3 Months", "Beginner to Intermediate", "classic",
             "Build strong programming foundations with C and modern C++.",
             ["C fundamentals", "Pointers & memory", "C++ OOP", "STL", "Templates", "Project"]),
            ("PHP Development", "2 Months", "Beginner to Intermediate", "budget",
             "Server-side scripting with PHP for dynamic websites.",
             ["PHP syntax", "Forms & sessions", "MySQL integration", "OOP PHP", "Mini project"]),
            (".NET Development", "3 Months", "Intermediate", "premium",
             "Build robust applications using the .NET framework and C#.",
             ["C# fundamentals", "ASP.NET", "Entity Framework", "Web APIs", "Project"]),
        ],
    },
    "full-stack": {
        "name": "Full Stack Development",
        "icon": "layers",
        "description": "End-to-end web development covering front-end, back-end and databases.",
        "courses": [
            ("MERN Full Stack", "6 Months", "Beginner to Advanced", "premium",
             "MongoDB, Express, React and Node.js to build complete web apps.",
             ["HTML/CSS/JS", "React", "Node & Express", "MongoDB", "Authentication", "Deployment", "Capstone"]),
            ("MEAN Full Stack", "6 Months", "Beginner to Advanced", "premium",
             "MongoDB, Express, Angular and Node.js full-stack stack.",
             ["TypeScript", "Angular", "Node & Express", "MongoDB", "REST APIs", "Capstone"]),
            ("Python Full Stack", "6 Months", "Beginner to Advanced", "premium",
             "Full-stack development with Python, Django/Flask and React.",
             ["Python & Django", "REST APIs", "React front-end", "Databases", "Deployment", "Capstone"]),
            ("Java Full Stack", "6 Months", "Beginner to Advanced", "premium",
             "Enterprise full-stack with Spring Boot and a modern front-end.",
             ["Core Java", "Spring Boot", "REST APIs", "React/Angular", "SQL", "Capstone"]),
        ],
    },
    "mobile-app": {
        "name": "Mobile App Development",
        "icon": "smartphone",
        "description": "Build native and cross-platform mobile applications.",
        "courses": [
            ("Android Development", "4 Months", "Beginner to Advanced", "classic",
             "Native Android apps with Kotlin and Android Studio.",
             ["Kotlin basics", "UI & layouts", "Activities & fragments", "Data storage", "APIs", "Play Store deploy"]),
            ("iOS Development", "4 Months", "Beginner to Advanced", "premium",
             "Build iOS apps with Swift and SwiftUI.",
             ["Swift basics", "SwiftUI", "Navigation", "Networking", "Core Data", "App Store deploy"]),
            ("Flutter Development", "4 Months", "Beginner to Advanced", "premium",
             "Cross-platform apps for Android and iOS with Flutter & Dart.",
             ["Dart basics", "Widgets", "State management", "APIs", "Firebase", "Publishing"]),
            ("React Native", "4 Months", "Intermediate", "classic",
             "Cross-platform mobile apps using React Native.",
             ["JS & React", "Components", "Navigation", "Native modules", "Deployment"]),
        ],
    },
    "cybersecurity": {
        "name": "Cybersecurity & Networking",
        "icon": "shield",
        "description": "Protect systems and networks with security and networking expertise.",
        "courses": [
            ("CCNA Certification", "3 Months", "Beginner to Intermediate", "classic",
             "Cisco Certified Network Associate networking fundamentals.",
             ["Networking basics", "Routing", "Switching", "IP services", "Security fundamentals"]),
            ("CCNP Certification", "4 Months", "Advanced", "premium",
             "Advanced enterprise networking with Cisco CCNP.",
             ["Advanced routing", "Enterprise networks", "VPN", "Troubleshooting"]),
            ("Ethical Hacking", "3 Months", "Intermediate", "premium",
             "Penetration testing and ethical hacking fundamentals.",
             ["Reconnaissance", "Scanning", "Exploitation basics", "Web security", "Reporting"]),
            ("CompTIA Security+", "3 Months", "Intermediate", "classic",
             "Foundational cybersecurity certification preparation.",
             ["Threats & attacks", "Architecture", "Operations", "Governance & risk"]),
        ],
    },
    "database": {
        "name": "Database Management",
        "icon": "database",
        "description": "Design, query and administer relational databases.",
        "courses": [
            ("MySQL", "2 Months", "Beginner to Intermediate", "budget",
             "Relational database design and SQL with MySQL.",
             ["SQL basics", "Joins", "Stored procedures", "Indexing", "Administration"]),
            ("Oracle Database", "3 Months", "Intermediate", "classic",
             "Oracle SQL, PL/SQL and database administration.",
             ["SQL", "PL/SQL", "Tuning", "Backup & recovery"]),
            ("Microsoft SQL Server", "2 Months", "Intermediate", "classic",
             "T-SQL and SQL Server administration.",
             ["T-SQL", "Stored procedures", "Performance", "Administration"]),
        ],
    },
    "data-science": {
        "name": "Data Science & AI",
        "icon": "chart",
        "description": "Turn data into insight with analytics, machine learning and AI.",
        "courses": [
            ("Data Science with Python", "6 Months", "Beginner to Advanced", "premium",
             "Statistics, machine learning and visualization with Python.",
             ["Python for data", "NumPy & Pandas", "Visualization", "Machine learning", "Model deployment", "Capstone"]),
            ("Machine Learning", "4 Months", "Intermediate to Advanced", "premium",
             "Supervised and unsupervised machine learning techniques.",
             ["ML foundations", "Regression", "Classification", "Clustering", "Model evaluation"]),
            ("Data Analytics", "3 Months", "Beginner to Intermediate", "classic",
             "Analyze and visualize data with Excel, SQL and Power BI.",
             ["Excel analytics", "SQL", "Power BI", "Dashboards", "Storytelling"]),
        ],
    },
    "cloud": {
        "name": "Cloud Computing",
        "icon": "cloud",
        "description": "Deploy and manage applications on leading cloud platforms.",
        "courses": [
            ("AWS Solutions Architect", "3 Months", "Intermediate", "premium",
             "Design and deploy scalable systems on Amazon Web Services.",
             ["Cloud basics", "EC2 & S3", "Networking", "Databases", "Architecture best practices"]),
            ("Microsoft Azure", "3 Months", "Intermediate", "premium",
             "Cloud services and administration on Microsoft Azure.",
             ["Azure fundamentals", "Compute & storage", "Networking", "Identity", "Deployment"]),
            ("Google Cloud Platform", "3 Months", "Intermediate", "classic",
             "Build and run workloads on Google Cloud.",
             ["GCP fundamentals", "Compute", "Storage", "Networking", "Deployment"]),
            ("DevOps", "4 Months", "Intermediate to Advanced", "premium",
             "CI/CD, containers and infrastructure automation.",
             ["Linux & Git", "Docker", "Kubernetes", "CI/CD pipelines", "Monitoring"]),
        ],
    },
    "sap": {
        "name": "SAP Modules",
        "icon": "boxes",
        "description": "Enterprise resource planning training across core SAP modules.",
        "courses": [
            ("SAP FICO", "3 Months", "Intermediate", "premium",
             "SAP Financial Accounting and Controlling module.",
             ["General ledger", "Accounts payable/receivable", "Asset accounting", "Controlling"]),
            ("SAP MM", "3 Months", "Intermediate", "classic",
             "SAP Materials Management module.",
             ["Procurement", "Inventory", "Invoice verification", "Master data"]),
            ("SAP ABAP", "3 Months", "Intermediate to Advanced", "premium",
             "Programming in SAP with ABAP.",
             ["ABAP basics", "Reports", "Module pool", "Enhancements"]),
        ],
    },
    "testing": {
        "name": "Software Testing",
        "icon": "check",
        "description": "Manual and automation testing for quality software delivery.",
        "courses": [
            ("Manual Testing", "2 Months", "Beginner", "budget",
             "Fundamentals of software testing and QA processes.",
             ["SDLC & STLC", "Test cases", "Bug tracking", "Test management"]),
            ("Selenium Automation", "3 Months", "Intermediate", "classic",
             "Web automation testing with Selenium WebDriver.",
             ["Java/Python basics", "Selenium WebDriver", "TestNG", "Frameworks", "CI integration"]),
            ("API Testing", "2 Months", "Intermediate", "classic",
             "REST API testing with Postman and automation tools.",
             ["HTTP & REST", "Postman", "Assertions", "Automation"]),
        ],
    },
    "digital-marketing": {
        "name": "Digital Marketing",
        "icon": "megaphone",
        "description": "Grow brands online with modern digital marketing skills.",
        "courses": [
            ("Digital Marketing", "3 Months", "Beginner to Advanced", "classic",
             "SEO, SEM, social media and content marketing end-to-end.",
             ["SEO", "Google Ads", "Social media", "Email marketing", "Analytics", "Campaign project"]),
        ],
    },
}


# (name, city, address, phone, hours, is_primary)
BRANCHES = [
    ("Madurai (Head Office)", "Madurai",
     "227, IInd Floor, Church Road, Anna Nagar, Madurai - 625020, Tamil Nadu",
     "096777 81155 / 096777 24437",
     "Mon-Sat: 9 AM - 7 PM, Sun: 10 AM - 3 PM", True),
    ("Chennai", "Chennai", "Anna Nagar, Chennai, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Coimbatore", "Coimbatore", "Gandhipuram, Coimbatore, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Trichy", "Trichy", "Thillai Nagar, Trichy, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Tirunelveli", "Tirunelveli", "Palayamkottai, Tirunelveli, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Salem", "Salem", "Fairlands, Salem, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Erode", "Erode", "Perundurai Road, Erode, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Vellore", "Vellore", "Gandhi Nagar, Vellore, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Thanjavur", "Thanjavur", "Medical College Road, Thanjavur, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Dindigul", "Dindigul", "Salai Road, Dindigul, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
    ("Nagercoil", "Nagercoil", "Vadasery, Nagercoil, Tamil Nadu", "096777 81155", "Mon-Sat: 9 AM - 7 PM", False),
]


TESTIMONIALS = [
    ("Priya R.", "MERN Full Stack Graduate", "The hands-on projects and mentor support made all the difference. I landed a developer role within two months of finishing.", 5),
    ("Karthik S.", "Data Science Student", "Trainers explain complex topics simply and the placement team genuinely cares. Highly recommend the data science track.", 5),
    ("Divya M.", "CCNA Certified", "Great lab access and real equipment practice. Cleared my certification on the first attempt.", 5),
    ("Arun V.", "Python Full Stack Graduate", "Updated curriculum and real-world assignments. The interview preparation sessions were incredibly useful.", 5),
]


# (title, tag, excerpt, content)
BLOG_POSTS = [
    ("5 Skills Every Full Stack Developer Needs in 2026", "Career",
     "From version control to cloud deployment, here are the core skills that make you job-ready as a full stack developer.",
     "The full stack landscape keeps evolving, but a few skills stay essential. Strong fundamentals in JavaScript and at least one back-end language, comfort with version control and Git workflows, an understanding of REST and modern APIs, hands-on experience deploying to the cloud, and the ability to write clean, testable code. Build real projects, contribute to open source, and keep a portfolio that shows your work."),
    ("How to Prepare for Your First Tech Interview", "Interview",
     "A practical guide to acing technical and HR rounds, with tips on data structures, projects and communication.",
     "Interview preparation is part knowledge, part practice. Revise core data structures and algorithms, be ready to walk through your projects in depth, and practise explaining your thought process out loud. For HR rounds, prepare concise answers about your strengths, goals and why you want the role. Mock interviews with a mentor make a huge difference."),
    ("Why Cloud Certifications Boost Your Career", "Cloud",
     "AWS, Azure and Google Cloud certifications are in high demand. Here's how they accelerate your growth.",
     "Cloud skills are among the most sought-after in the industry. A recognised certification validates your knowledge to employers, opens doors to higher-paying roles, and gives you a structured path to learn cloud architecture, security and cost optimisation. Pair the certification with hands-on labs and a couple of deployed projects for the best results."),
    ("Data Science vs Data Analytics: Which Path Is Right for You?", "Data Science",
     "Understand the differences between these two popular career tracks and choose the one that fits your goals.",
     "Data analytics focuses on interpreting existing data to answer business questions, while data science builds predictive models and works with machine learning. Analytics is a great entry point if you enjoy dashboards and storytelling with data. Data science suits those who like statistics, programming and building models. Both are in demand — pick based on the kind of work you enjoy."),
]

# (title, issuer, year, description)
AWARDS = [
    ("Best Software Training Institute", "Education Excellence Awards", "2024",
     "Recognised for outstanding curriculum quality and student placement outcomes."),
    ("Top Skill Development Partner", "Industry Skills Council", "2023",
     "Awarded for bridging the industry-academia skill gap across Tamil Nadu."),
    ("Excellence in IT Education", "Regional Education Forum", "2023",
     "Honoured for delivering hands-on, job-focused technology training."),
    ("Outstanding Placement Record", "Career Growth Awards", "2022",
     "Acknowledged for consistent placement assistance and industry partnerships."),
]


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        # Admin
        if not Admin.query.filter_by(email=DEFAULT_ADMIN["email"]).first():
            db.session.add(Admin(
                name=DEFAULT_ADMIN["name"],
                email=DEFAULT_ADMIN["email"],
                password_hash=hash_password(DEFAULT_ADMIN["password"]),
                role="admin",
            ))
            print(f"  + admin {DEFAULT_ADMIN['email']} / {DEFAULT_ADMIN['password']}")

        # Features
        for order, (title, desc, icon) in enumerate(FEATURES):
            if not Feature.query.filter_by(title=title).first():
                db.session.add(Feature(title=title, description=desc, icon=icon, order=order))

        # Categories + courses
        for cat_order, (slug, cat) in enumerate(CATALOG.items()):
            category = CourseCategory.query.filter_by(slug=slug).first()
            if not category:
                category = CourseCategory(
                    name=cat["name"], slug=slug, icon=cat["icon"],
                    description=cat["description"], order=cat_order,
                )
                db.session.add(category)
                db.session.flush()
            for c_order, (title, duration, level, tier, summary, syllabus) in enumerate(cat["courses"]):
                course_slug = _slugify(title)
                if not Course.query.filter_by(slug=course_slug).first():
                    db.session.add(Course(
                        category_id=category.id,
                        title=title,
                        slug=course_slug,
                        summary=summary,
                        description=summary,
                        duration=duration,
                        level=level,
                        tier=tier,
                        syllabus=json.dumps(syllabus),
                        order=c_order,
                        is_active=True,
                    ))

        # Branches
        for order, (name, city, address, phone, hours, is_primary) in enumerate(BRANCHES):
            if not Branch.query.filter_by(name=name).first():
                db.session.add(Branch(
                    name=name, city=city, address=address, phone=phone,
                    email="info@elysiumacademy.org", hours=hours,
                    is_primary=is_primary, order=order,
                ))

        # Testimonials
        for order, (name, role, content, rating) in enumerate(TESTIMONIALS):
            if not Testimonial.query.filter_by(name=name, content=content).first():
                db.session.add(Testimonial(
                    name=name, role=role, content=content, rating=rating,
                    is_active=True, order=order,
                ))

        # Blog posts
        for (title, tag, excerpt, content) in BLOG_POSTS:
            slug = _slugify(title)
            if not BlogPost.query.filter_by(slug=slug).first():
                db.session.add(BlogPost(
                    title=title, slug=slug, tag=tag, excerpt=excerpt,
                    content=content, author="Elysium Academy", is_published=True,
                ))

        # Awards
        for order, (title, issuer, year, desc) in enumerate(AWARDS):
            if not Award.query.filter_by(title=title).first():
                db.session.add(Award(
                    title=title, issuer=issuer, year=year, description=desc, order=order,
                ))

        db.session.commit()
        print("Seed complete.")


def _slugify(value):
    import re
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


if __name__ == "__main__":
    seed()
