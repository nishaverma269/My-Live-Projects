var userId = '<% =userId %>';
        if (userId) {
            var favorites = '<%= new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(favorites)%>';
            favorites = JSON.parse(favorites);
            var urls = favorites.map(e => e.url)

            if (urls.includes(window.location.pathname)) {
                var element = document.getElementById('add');
                element.style.color = 'rgb(255, 224, 0)';
            }

            // Favorites Handler
            var refreshFav = function () {
                if (document.getElementById('add').style.color != 'rgb(255, 224, 0)') {
                    document.getElementById('fav').innerHTML = '<li><a onclick="add()" style="font-weight:bold;">Add to Your Favorites</a></li>';
                }
                else {
                    document.getElementById('fav').innerHTML = "";
                }
                if (favorites.length > 0) {
                    document.getElementById('fav').innerHTML += '<li><a onclick="manageFavorites()" style="font-weight:bold;">Manage Your Favorites</a></li>';
                    document.getElementById('fav').innerHTML += '<li class="divider"></li>';
                }
                $.each(favorites, function (index, value) {
                    document.getElementById('fav').innerHTML += '<li><a href=' + '"' + value.url + '">' + value.title + '</a></li>';
                });
            }
            var manageFavorites = function () {
                $('#removefavoritesModal').modal('show');
                document.getElementById('listFav').innerHTML = '<label style="font-size:14px; font-weight:bold;">' + "You can remove your favorites here. Click the remove button." + '</label><br><br><ul>';
                $.each(favorites, function (index, value) {
                    document.getElementById('listFav').innerHTML += '<li style="font-size:14px;">' + value.title +
                        '<button class="btn btn-default bs-tooltip fas fa-times" style="color:red;margin-left:10px;border:none" onclick="remove(this,' + "'" + value.url + "'" + ')"></button>' +
                        '</li>';
                });
                document.getElementById('listFav').innerHTML += '</ul>';
            }
            var remove = function (el, url) {
                $.ajax({
                    async: false,
                    url: '/qms/Base/Save',
                    type: 'POST',
                    contentType: 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({ url: url, title: "", actionTypeId: 3, userId: userId }),
                    success: function () {
                        var index = urls.indexOf(url);
                        urls.splice(index, 1);
                        favorites.splice(index, 1);
                        manageFavorites();
                        if (window.location.pathname === url) {
                            document.getElementById('add').style.color = 'white';
                        }
                        console.log("Favorite Removed");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(jqXHR);
                        console.log(textStatus);
                        console.log(errorThrown);
                    }
                });
            }
            var add = function () {
                $(".modal-body #title").val("");
                $('#addfavoritesModal').modal('show');
            }
            var save = function () {
                var url = window.location.pathname;
                var title = $(".modal-body #title").val().trim();

                if (title) {
                    $.ajax({
                        async: false,
                        url: '/qms/Base/Save',
                        type: 'POST',
                        contentType: 'application/json',
                        dataType: 'json',
                        data: JSON.stringify({ url: url, title: title, actionTypeId: 1, userId: userId }),
                        success: function () {
                            favorites.push({ 'url': url, 'title': title });
                            if (window.location.pathname === url) {
                                document.getElementById('add').style.color = 'rgb(255, 224, 0)';
                            }
                            console.log("Favorite Added");
                            $('#addfavoritesModal').modal('hide');
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(jqXHR);
                            console.log(textStatus);
                            console.log(errorThrown);
                        }
                    });
                }
            }
            var focusinFunc = function (x) {
                x.style.background = "white";
                if (x.style.color == "" || x.style.color == "white") {
                    x.style.color = "rgb(95, 111, 129)";
                }
            }
            var focusoutFunc = function (x) {
                x.style.background = "none";
                if (x.style.color == "rgb(95, 111, 129)") {
                    x.style.color = "white";
                } 
            }