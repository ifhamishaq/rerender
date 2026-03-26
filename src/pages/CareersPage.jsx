import careersData from '../data/careers.json';

const CareersPage = () => {
    return (
        <div className="careers-page">
            <header className="careers-hero-premium">
                <div className="container">
                    <div className="editorial-meta-row">
                        <div className="meta-block">
                            <span className="mono-label">[REF: RE-ACADEMY-V3]</span>
                            <span className="mono-label">[LOC: REMOTE_CORE]</span>
                        </div>
                        <div className="meta-line" />
                        <div className="meta-block align-right">
                            <span className="mono-label">TALENT ACQUISITION</span>
                            <span className="mono-label">EST. 2026</span>
                        </div>
                    </div>

                    <div className="hero-typography">
                        <h1 className="giant-title">
                            <span className="outline-text">JOIN THE</span><br />
                            TEAM
                        </h1>
                        <div className="serif-subtitle-wrap">
                            <span className="serif-italic">Scaling your</span>
                            <span className="accent-line" />
                            <span className="sans-bold">CREATIVITY</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="careers-grid-layout container">
                {careersData.map((career, index) => (
                    <div key={career.id} className={`editorial-row ${index % 2 !== 0 ? 'reverse' : ''}`}>
                        <div className="row-sidemark">{career.sidemark}</div>
                        <motion.div 
                            className={`program-card-premium ${career.style}`}
                            initial={{ opacity: 0, x: index % 2 !== 0 ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="card-top">
                                <h2 className="card-label">{career.type}</h2>
                                <div className={`status-indicator ${career.status === 'COMING_SOON' ? 'waiting' : ''}`}>
                                    {career.status}
                                </div>
                            </div>
                            <div className="card-main">
                                <h3 className="card-title">
                                    <span className="serif-italic">{career.serifTitle}</span><br/>
                                    <span className="sans-black">{career.title}</span>
                                </h3>
                                <p className="card-desc">
                                    {career.description}
                                </p>
                            </div>
                            <div className="card-footer">
                                <ul className="technical-specs">
                                    {career.specs.map((spec, i) => (
                                        <li key={i}>{spec}</li>
                                    ))}
                                </ul>
                                <Magnetic strength={0.2} padding={50}>
                                    {career.disabled ? (
                                        <button className="hero-cta editorial-cta minimal disabled">
                                            {career.buttonLabel}
                                        </button>
                                    ) : (
                                        <a href={career.link} className="hero-cta editorial-cta minimal">
                                            {career.buttonLabel}
                                        </a>
                                    )}
                                </Magnetic>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </main>

            <section className="careers-manifesto container">
                <div className="manifesto-box">
                    <span className="mono-label">// OUR VALUES</span>
                    <h2 className="manifesto-text">
                        WE MAKE STUFF THAT LOOKS <span className="serif-italic">Good</span>. 
                        WHETHER YOU ARE AN INTERN OR A PRO, 
                        WE WANT TO WORK WITH THE BEST.
                    </h2>
                </div>
            </section>
        </div>
    );
};

export default CareersPage;
