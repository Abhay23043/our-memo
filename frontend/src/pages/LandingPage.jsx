import {
    Heart,
    Lock,
    ShieldCheck,
    Image,
    ArrowRight,
    UserPlus
} from "lucide-react";

import {
    Link
} from "react-router-dom";


function Landing() {

    return (

        <main
            style={{
                minHeight: "100vh",
                background: "var(--background, #fafafa)",
                color: "var(--text, #111)"
            }}
        >

            {/* ================================
                NAVBAR
            ================================= */}

            <header
                style={{
                    width: "100%",
                    borderBottom:
                        "1px solid var(--border, #e8e8e8)",
                    background:
                        "rgba(255,255,255,0.85)",
                    backdropFilter:
                        "blur(12px)"
                }}
            >

                <div
                    style={{
                        maxWidth: "1100px",
                        margin: "0 auto",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}
                >

                    {/* LOGO */}

                    <Link
                        to="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            textDecoration: "none",
                            color: "inherit",
                            fontWeight: 700,
                            fontSize: "19px"
                        }}
                    >

                        <span
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "11px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#111",
                                color: "#fff"
                            }}
                        >

                            <Heart
                                size={18}
                                fill="currentColor"
                            />

                        </span>

                        Our Memo

                    </Link>


                    {/* LOGIN */}

                    <Link
                        to="/login"
                        style={{
                            textDecoration: "none",
                            color: "#111",
                            fontSize: "14px",
                            fontWeight: 600,
                            padding: "9px 16px",
                            border:
                                "1px solid #ddd",
                            borderRadius: "10px",
                            background: "#fff"
                        }}
                    >
                        Login
                    </Link>

                </div>

            </header>


            {/* ================================
                HERO
            ================================= */}

            <section
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding:
                        "90px 20px 70px",
                    textAlign: "center"
                }}
            >

                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 24px",
                        borderRadius: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#111",
                        color: "#fff"
                    }}
                >

                    <Heart
                        size={30}
                        fill="currentColor"
                    />

                </div>


                <h1
                    style={{
                        margin: "0",
                        fontSize:
                            "clamp(38px, 7vw, 68px)",
                        lineHeight: "1.05",
                        letterSpacing: "-0.045em",
                        fontWeight: 750
                    }}
                >
                    Your memories.
                    <br />
                    <span
                        style={{
                            opacity: 0.55
                        }}
                    >
                        Just for you.
                    </span>
                </h1>


                <p
                    style={{
                        maxWidth: "600px",
                        margin:
                            "24px auto 0",
                        color:
                            "var(--text-secondary, #666)",
                        fontSize:
                            "clamp(15px, 2vw, 18px)",
                        lineHeight: "1.7"
                    }}
                >
                    Our Memo is a private space to
                    keep your special memories,
                    photos and moments organized
                    in one place.
                </p>


                {/* BUTTONS */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "32px"
                    }}
                >

                    <Link
                        to="/login"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding:
                                "13px 20px",
                            borderRadius: "11px",
                            background: "#111",
                            color: "#fff",
                            textDecoration:
                                "none",
                            fontSize: "14px",
                            fontWeight: 600
                        }}
                    >

                        Login

                        <ArrowRight
                            size={16}
                        />

                    </Link>


                    <Link
                        to="/register"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding:
                                "13px 20px",
                            borderRadius: "11px",
                            background: "#fff",
                            color: "#111",
                            textDecoration:
                                "none",
                            border:
                                "1px solid #ddd",
                            fontSize: "14px",
                            fontWeight: 600
                        }}
                    >

                        <UserPlus
                            size={16}
                        />

                        Create account

                    </Link>

                </div>

            </section>


            {/* ================================
                FEATURES
            ================================= */}

            <section
                style={{
                    maxWidth: "1050px",
                    margin: "0 auto",
                    padding:
                        "20px 20px 90px"
                }}
            >

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px"
                    }}
                >

                    <Feature
                        icon={
                            <Lock
                                size={22}
                            />
                        }
                        title="Private"
                        text="Your memories stay protected and accessible only to authorized users."
                    />


                    <Feature
                        icon={
                            <Image
                                size={22}
                            />
                        }
                        title="Organized"
                        text="Keep your photos and memories organized in one simple place."
                    />


                    <Feature
                        icon={
                            <ShieldCheck
                                size={22}
                            />
                        }
                        title="Secure"
                        text="Authentication and protected access keep private content private."
                    />

                </div>

            </section>


            {/* ================================
                FOOTER
            ================================= */}

            <footer
                style={{
                    borderTop:
                        "1px solid var(--border, #e8e8e8)",
                    padding: "25px 20px",
                    textAlign: "center",
                    color:
                        "var(--text-secondary, #777)",
                    fontSize: "13px"
                }}
            >

                Our Memo © {new Date().getFullYear()}

            </footer>

        </main>

    );

}


function Feature({
    icon,
    title,
    text
}) {

    return (

        <div
            style={{
                padding: "24px",
                border:
                    "1px solid var(--border, #e8e8e8)",
                borderRadius: "18px",
                background:
                    "var(--surface, #fff)"
            }}
        >

            <div
                style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f3f3",
                    marginBottom: "18px"
                }}
            >

                {icon}

            </div>


            <h3
                style={{
                    margin:
                        "0 0 8px",
                    fontSize: "16px"
                }}
            >
                {title}
            </h3>


            <p
                style={{
                    margin: 0,
                    color:
                        "var(--text-secondary, #777)",
                    fontSize: "13px",
                    lineHeight: "1.6"
                }}
            >
                {text}
            </p>

        </div>

    );

}


export default Landing;