import { useLanguage } from "../i18n/useLanguage.js";
import { languages } from "../i18n/messages.js";

function Header({ currentPage, navigate }) {
    const { selectedLanguage, setSelectedLanguage, messages } = useLanguage();

    return (
        <header className="header">
            <div className="header__brand">
                <h1 className="header__title">{messages.header.project}</h1>
                <p className="header__subtitle">{messages.header.subtitle}</p>
            </div>

            <nav className="header__nav" aria-label="Primary">
                <button
                    type="button"
                    className={currentPage === "search"
                        ? "header__button header__button--active"
                        : "header__button"}
                    aria-current={currentPage === "search" ? "page" : undefined}
                    onClick={() => navigate("/search")}
                >
                    {messages.header.search}
                </button>
                <button
                    type="button"
                    className={currentPage === "admin"
                        ? "header__button header__button--active"
                        : "header__button"}
                    aria-current={currentPage === "admin" ? "page" : undefined}
                    onClick={() => navigate("/library")}
                >
                    {messages.header.library}
                </button>
            </nav>

            <div className="language-switcher" aria-label={messages.header.language}>
                {languages.map((language) => (
                    <button
                        key={language.id}
                        type="button"
                        title={language.title}
                        className={selectedLanguage === language.id
                            ? "language-switcher__button language-switcher__button--active"
                            : "language-switcher__button"}
                        aria-pressed={selectedLanguage === language.id}
                        onClick={() => setSelectedLanguage(language.id)}
                    >
                        {language.label}
                    </button>
                ))}
            </div>
        </header>
    );
}

export default Header;
