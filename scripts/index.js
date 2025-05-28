let isNavOpen = false;

document.getElementById('jewlery')?.addEventListener('sl-change', event => {
    console.log(event.target.checked ? 'checked' : 'not checked');
    document.getElementById('jewlery-value').textContent = event.target.checked ? 'Gold' : 'Silver'
});


document.getElementById('hamburger')?.addEventListener('click', event => {
    isNavOpen = !isNavOpen;
    const hamburgerNavList= document.getElementById('hamburger__nav');
    const main= document.getElementById('main');
    if (isNavOpen) {
        hamburgerNavList.classList.add('nav__list--open');
        main.classList.add('visually-hidden');
    } else {
        hamburgerNavList.classList.remove('nav__list--open');
        main.classList.remove('visually-hidden');
    }
});

const linkClick = () => {
    isNavOpen = false;
    document.getElementById('hamburger__nav')?.classList.remove('nav__list--open');
    document.getElementById('main')?.classList.remove('visually-hidden');
    return true;
}