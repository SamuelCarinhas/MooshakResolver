(function() {

    const resolver = new Resolver({
        element: document.querySelector('.contestants'),
        content: './contest/Content.xml'
    });

    resolver.init();

})();
