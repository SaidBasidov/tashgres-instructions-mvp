function Header({ currentPage, setCurrentPage }) {
    return (
        <header className="header">
            <div>
                <h1 className="header__title">ТашГРЭС</h1>
                <p className="header__subtitle">MVP сервиса инструкций</p>
            </div>

            <nav className="header__nav">
                <button 
                className={
                    currentPage === "search" 
                    ? "header__button header__button--active"
                    : "header__button"
                } onClick={() => setCurrentPage("search")}>Поиск</button>
                <button 
                className={
                    currentPage === "admin" 
                    ? "header__button header__button--active"
                    : "header__button"
                } onClick={() => setCurrentPage("admin")}>Библиотека</button>
            </nav>
        </header>
    );
}

export default Header;