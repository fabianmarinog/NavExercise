/*
By Fabian Mariño 2015
*/

var App = {

    init: function(config) {
        /*Initialize */
        this.config = config || {};
        this.navItems = null;

        /*DOM references */
        this.dropdownMask = document.querySelector(".dropdown-mask");
        this.mainContainer = document.querySelector("main.container");
        this.navigationContainer = document.querySelector(".nav-container");
        this.mainContent = document.querySelector(".main-content");

        this.hamIcon = document.querySelector(".hamburger-icon");
        this.brandIcon = document.querySelector(".navbar-brand");
        this.closeIcon = document.querySelector(".close-icon");

        this.previousLi = null; //Reference to list item selected on menu

        this.loadData();
    },

    /*Fetchs JSON data and display menu on success*/
    loadData : function(){

        this.getNavItems(this.config.navUrl).then(function(data) {

            //Success we have the data and now display into the DOM
            App.displayNavigationMenu(data.items);
            
        }, function(status) { //Error in Request
            alert("Something went wrong while fetching data.");
        });
    },

    /* Set events on DOM elements. click on menus to hide/display navigation */
    bindEvents: function() {

        //Sets click listener on main container so we can detect outside clicks and hide submenus
        this.mainContainer.addEventListener("click", this.hideSubMenu, false);

        //Sets click listener for every anchor that contains subitems
        [].forEach.call(document.querySelectorAll('.navbar ul li > [href="#"]'), function (el) {
          el.addEventListener("click", App.displaySubMenu, false);
        });

        //Sets click listener on hamburger icon to display nav menu on mobile
        this.hamIcon.addEventListener("click", this.showMobileNav, false);

        //Sets click listener on close icon to hide nav menu on mobile
        this.closeIcon.addEventListener("click", this.hideMobileNav, false);

        //Sets on resize event to hide navigation mask if we are not on desktop
        if(this.isMobile() === false) window.addEventListener("resize", this.onResize);
    },

    /*Displays navigation menu*/
    displayNavigationMenu : function(menuItems){    

        this.navItems = menuItems;

        // Create the list element:
        var list = document.createElement("ul");
        list.setAttribute("class","navbar-nav");

        for(var i = 0; i < menuItems.length; i++) {
            // Create the list item:
            var item = document.createElement("li");

            //Create anchor element item
            var link = document.createElement("a");
            var objItem = menuItems[i];

            // Set link contents:
            link.appendChild(document.createTextNode(objItem.label));

            //Validation using href attribute so nested menu will be displayed
            var hrefAttribute = objItem.url;
            if(objItem.items.length > 0){
                hrefAttribute = "#";
                item.setAttribute("class", "downArrow");
                // Set down arrow span:
                link.appendChild(document.createElement("span"));
            }

            //Sets href attribute
            link.setAttribute("href", hrefAttribute);


            //Append link to list item
            item.appendChild(link);

            /*If menu item contains sub items then create a new ul list */
            if(objItem.items.length > 0){

                //Create the nested list element
                var nestedUl = document.createElement("ul");

                for(var j = 0, ntot = objItem.items.length; j < ntot; j++){
                    //Create the nested list item:
                    var nItem = document.createElement("li");

                    //Create the anchor nested element item
                    var nLink = document.createElement("a");
                    var nObjItem = objItem.items[j];

                    //Set href attribute so user will be able to navigate
                    nLink.setAttribute("href", nObjItem.url); 

                    //Set link contents
                    nLink.appendChild(document.createTextNode(nObjItem.label));

                    //Append link to nested link item
                    nItem.appendChild(nLink);

                    //Append item to nested ul list
                    nestedUl.appendChild(nItem);
                }

                //Append nested list to menu item
                item.appendChild(nestedUl);
            }

            // Add item to the list:
            list.appendChild(item);
        }

        //Inserts list into navigation container
        this.navigationContainer.insertBefore(list, this.navigationContainer.firstChild);

        //Set event listener for click to show/hide submenus
        this.bindEvents();
    },

    //Displays sub menu list items
    displaySubMenu : function(e){
        if(!e.target.getAttribute("href") || e.target.getAttribute("href") === "#") e.preventDefault();

        e.stopImmediatePropagation();

        var parentLi = e.target.parentNode;
        if(!parentLi.nodeName) return;
        if(parentLi.nodeName === "A") parentLi = parentLi.parentNode;

        if(parentLi.classList.length > 1) {
            if(parentLi.classList[1] === "dropdown"){
                App.hideSubMenu();
                App.updateMaskHeight();
                return;
            }
        }

        if(App.isMobile() === false) App.dropdownMask.style.display = "block";

        if(parentLi.nodeName === "LI") {
            parentLi.classList.add("dropdown");
            App.updateMaskHeight();
        }
    },

    //Hides sub menu list items
    hideSubMenu : function(e){
        var dropdownLi = document.querySelectorAll(".dropdown");
        for(var i=0, tot = dropdownLi.length; i < tot; i++){
            dropdownLi[i].classList.remove("dropdown");
        }
        if(App.isMobile() === false) {
            App.dropdownMask.style.display = "none";
        }else{
            if(e && e.target.getAttribute("href") !== "#"){
                App.hideMobileNav();
            }
        }
    },

    //Displays mobile navigation menu
    showMobileNav : function(){
        App.hamIcon.style.display = "none";
        App.brandIcon.style.display = "block";
        App.closeIcon.style.display = "block";
        App.dropdownMask.style.display = "block";
        App.navigationContainer.style.display = "block";
        App.mainContent.classList.add("content-displayed");
        App.updateMaskHeight();
        setTimeout(function(){
            App.navigationContainer.classList.add("nav-displayed");
        }, 10);
    },

    //Hides mobile navigation menu
    hideMobileNav : function(){
        App.brandIcon.style.display = "none";
        App.closeIcon.style.display = "none";
        App.hamIcon.style.display = "block";
        App.dropdownMask.style.display = "none";
        App.mainContent.classList.remove("content-displayed");
        App.navigationContainer.classList.remove("nav-displayed");
    },

    //Updates dropdown mask height so it won't look bad when submenu items are displayed
    updateMaskHeight : function(){
        var nHeight = (App.isMobile() === true) ? App.navigationContainer.clientHeight : App.mainContent.clientHeight;
        App.dropdownMask.style.height = nHeight + "px";
    },

    //Calls json from server and fetches data
    getNavItems: function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("get", url, true);
            xhr.responseType = "json";
            xhr.onload = function() {
              var status = xhr.status;
              if (status == 200) {
                resolve(xhr.response);
              } else {
                reject(status);
              }
            };
            xhr.send();
        });
    },

    //Utility method to check if we are on smartphones or in desktops
    isMobile : function(){
        return (window.innerWidth < 768) ? true : false;
    },

    //Onresize function to update layout when user resizes window
    onResize : function(){
        App.hideMobileNav();
        App.hideSubMenu();
    }
};