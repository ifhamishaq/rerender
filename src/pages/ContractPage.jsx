import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ContractPage = () => {
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '10rem 2rem 4rem' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '4rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.5 }}>[LEGAL_DOCUMENT_v1.0]</span>
                        <Link to="/careers" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text)' }}>BACK</Link>
                    </div>
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontStyle: 'italic', fontWeight: 400 }}>
                        Portfolio Usage & Mutual Growth Agreement
                    </h1>
                </header>

                <div style={{ color: 'var(--color-text)', lineHeight: 1.8, fontSize: '1.05rem', opacity: 0.9 }}>
                    <section style={{ marginBottom: '3rem' }}>
                        <p><strong>BETWEEN:</strong></p>
                        <p><strong>RE-RENDER STUDIO</strong> ("The Agency")</p>
                        <p>AND</p>
                        <p><strong>THE APPLICANT</strong> ("The Creative Partner")</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>01 // MISSION STATEMENT</h2>
                        <p>The Agency is a boutique creative studio focused on high-performance editorial design. The Creative Partner seeks to collaborate with the Agency on upcoming client projects. This agreement ensures both parties are protected and empowered to grow.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>02 // PORTFOLIO USAGE RIGHTS</h2>
                        <p>The Creative Partner hereby grants the Agency a non-exclusive, perpetual, worldwide license to display, reproduce, and showcase any work submitted during the onboarding process or created during the term of this partnership.</p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', borderLeft: '1px solid var(--color-border)', marginTop: '1rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>• <strong>Context</strong>: The Agency may display this work on the official RE-RENDER website, social media, and client pitch decks.</li>
                            <li>• <strong>Credit</strong>: The Agency agrees to credit the Creative Partner where appropriate (e.g., "Creative Partner: [Name]") unless otherwise agreed for white-label projects.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>03 // CLIENT ACQUISITION & REPRESENTATION</h2>
                        <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                            <li style={{ marginBottom: '1rem' }}>• <strong>Representation</strong>: The Agency will represent the Creative Partner's work as part of the "RE-RENDER Collective Portfolio".</li>
                            <li>• <strong>Non-Circumvention</strong>: The Creative Partner agrees not to bypass the Agency to work directly with clients introduced by the Agency for a period of 12 months following the introduction.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>04 // COMPENSATION</h2>
                        <p>The Creative Partner shall be compensated via a <strong>Fixed Monthly Retainer</strong> plus <strong>Variable Performance Bonuses</strong> (tied to project KPIs and client satisfaction). Specific amounts will be detailed in the individual Offer Letter or Onboarding Docket.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>05 // CONFIDENTIALITY (NDA)</h2>
                        <p>The Creative Partner acknowledges that they will have access to "Confidential Information" (client identities, studio workflows, pricing, and project data). The Partner agrees to keep this information strictly confidential and will not disclose it to any third party during or after the term of this partnership.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>06 // INTELLECTUAL PROPERTY (IP) OWNERSHIP</h2>
                        <p>While the Agency grants the Creative Partner "Portfolio Rights" as defined in Section 02, all legal Title, Copyright, and Intellectual Property rights for work created for Agency clients belong exclusively to the Agency (or the end Client). This is a "Work Made for Hire" agreement.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>07 // LIABILITY & INDEMNITY</h2>
                        <p>The Creative Partner warrants that all work submitted is original and does not infringe on any third-party copyrights. The Partner agrees to indemnify and hold the Agency harmless from any claims, damages, or legal fees resulting from a breach of this warranty.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>08 // INDEPENDENT CONTRACTOR STATUS</h2>
                        <p>This agreement establishes an Independent Contractor relationship. The Creative Partner is not an employee, agent, or legal representative of the Agency. The Partner is responsible for their own taxes, equipment, and insurance.</p>
                    </section>

                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--color-accent)' }}>09 // TERMINATION</h2>
                        <p>Either party may terminate the partnership with 7 days' written notice. Upon termination, Confidentiality and IP clauses remain in effect perpetually.</p>
                    </section>
                </div>

                <footer style={{ marginTop: '6rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', opacity: 0.5, fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
                    RE-RENDER STUDIO // COLLECTIVE GROWTH PROTOCOL // v1.0
                </footer>
            </div>
        </div>
    );
};

export default ContractPage;
