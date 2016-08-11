/* 
 * Connecting to StalkerPortal libruary
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

describe("Клиенты", function () {

    describe(StalkerClient.name, function () {

        var initer;
        var client;

        describe("Инициализация", function () {

            describe("#init, аргумент - объект initObject", function () {

                describe("При инициализации происходит подключение к Stalker серверу " +
                        "на основании имеющихся в InitObject логина и пароля или Mac адреса", function () {

                            beforeEach(function () {
                                initer = new initObject();
                                client = new StalkerClient();
                            });

                            it("подключение на основании Mac адреса", function (done) {
                                initer.setMac("08-00-27-9B-3E-8c");
                                client.init(initer).always(function () {
                                    assert.isTrue(client._authData.isLogin());
                                    done();
                                });
                            });

                            it("подключение на основании login/password", function (done) {
                                initer.setMac("08-00-27-9B-3E-8c");
                                initer.setLogin("63700");
                                initer.setPassword("1111");
                                client.init(initer).always(function () {
                                    assert.isTrue(client._authData.isLogin());
                                    done();
                                });
                            });

                        });

                describe("В случаях ошибок инициализация не производится. Отсутствие мак адреса тоже считается ошибкой", function () {

                    beforeEach(function () {
                        initer = new initObject();
                        client = new StalkerClient();
                    });

                    it("Мак адрес не найден в базе, логин не введен", function (done) {
                        initer.setMac("08-00-27-9B-3E-8d");
                        client.init(initer).always(function () {
                            assert.isFalse(client._authData.isLogin());
                            done();
                        });
                    });

                    it("Нет данных о мак адресе", function (done) {
                        initer.setLogin("63700");
                        client.init(initer).always(function () {
                            assert.isNull(client._authData);
                            done();
                        });
                    });

                    it("Неправильный логин", function (done) {
                        initer.setMac("08-00-27-9B-3E-8c");
                        initer.setLogin("67300");
                        client.init(initer).always(function () {
                            assert.isFalse(client._authData.isLogin());
                            done();
                        });
                    });

                    it("Неправильный пароль", function (done) {
                        initer.setMac("08-00-27-9B-3E-8c");
                        initer.setLogin("63700");
                        initer.setPassword("aaa");
                        client.init(initer).always(function () {
                            assert.isFalse(client._authData.isLogin());
                            done();
                        });
                    });

                });

            });

            describe("#clearData", function () {

                before(function () {
                    initer = new initObject();
                    client = new StalkerClient();
                    initer.setMac("08-00-27-9B-3E-8c");

                });

                it("очищает объект authObject", function (done) {

                    client.init(initer).then(
                            function () {
                                assert.isNotNull(client._authData.accessToken);
                                assert.isNotNull(client._authData.refreshToken);
                                assert.isNotNull(client._authData.expiresIn);
                                assert.isNotNull(client._authData.tokenType);
                                assert.isNotNull(client._authData.userID);

                                assert.isTrue(client.clearData(), "expected to clear data");
                                assert.isNull(client._authData.accessToken);
                                assert.isNull(client._authData.refreshToken);
                                assert.isNull(client._authData.expiresIn);
                                assert.isNull(client._authData.tokenType);
                                assert.isNull(client._authData.userID);
                            },
                            function () {
                                assert.isFalse(true, "expected to get inited");
                            }).always(
                            function () {
                                done();
                            });
                });

            });

        });

        describe("Работа с каналами", function () {

            before(function () {
                initer = new initObject();
                client = new StalkerClient();
                initer.setMac("08-00-27-9B-3E-8c");
            });

            describe("#getChannels, аргументы - genre_id, onlyFavotite", function () {

                function checkChannels(data) {
                    assert.isArray(data, "must be an array");
                    for (var i = 0; i < data.length; i++) {
                        assert.isArray(data[i], "must be an array");
                        assert.equal(data[i].length, 3);
                        assert.isString(data[i][1], "channels name must be a string");
                        if (data.length > 1 || data[0][1] != "ПУСТО") {
                            assert.isNumber(data[i][0], "expected channel id");
                            assert.isNumber(data[i][2], "expected epg id");
                        } else {
                            assert.equal(data[0][0], 0, "expected channel id");
                            assert.equal(data[0][2], "-", "expected epg id");
                        }
                    }
                }

                before(function (done) {
                    client.init(initer).then(function () {
                        done();
                    });
                });

                describe("в случае успеха, результатом должен быть массив каналов, представленных массивом из 3 элементов (id канала, название, id телепрограммы)", function () {

                    it("Список каналов не задавая жанр", function (done) {
                        client.getChannels().then(
                                function (data) {
                                    checkChannels(data);
                                },
                                function () {
                                    assert.isFalse(true, "expected not to see an error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("Список каналов жанра 'news'", function (done) {
                        client.getChannels('news').then(
                                function (data) {
                                    checkChannels(data);
                                },
                                function () {
                                    assert.isFalse(true, "expected not to see error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("Список избранных каналов не задавая жанр", function (done) {
                        client.getChannels('', true).then(
                                function (data) {
                                    checkChannels(data);
                                },
                                function () {
                                    assert.isFalse(true, "expected not to see error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("Список избранных каналов жанра news", function (done) {
                        client.getChannels('news', true).then(
                                function (data) {
                                    checkChannels(data);
                                },
                                function (error) {
                                    assert.isFalse(true, "expected not to see error");
                                }).always(
                                function () {
                                    done();
                                });

                    });

                });

                describe("в случае неудачи должна вернуться ошибка", function () {

                    it("запрос каналов по несуществующему жанру additional", function (done) {
                        client.getChannels('additional').then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get channels for this genre");
                                },
                                function (data) {
                                    assert.isString(data, "have to be string");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("запрос избранных каналов по несуществующему жанру additional", function (done) {
                        client.getChannels('additional', true).then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get channels for this genre");
                                },
                                function (data) {
                                    assert.isString(data, "have to be string");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("запрос каналов без инициализации", function (done) {
                        client = new StalkerClient();
                        client.getChannels('additional').then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get channels for this genre");
                                },
                                function (data) {
                                    assert.isString(data, "have to be string");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

            });
            describe("#getChannelLink, аргумент - channelID", function () {

                var channelList;

                before(function (done) {
                    client.init(initer).then(
                            function () {
                                client.getChannels().then(
                                        function (channels) {
                                            channelList = channels;
                                        },
                                        function () {
                                            assert.isFalse(true, "expected to get channels");
                                        }).always(
                                        function () {
                                            done();
                                        });
                            },
                            function () {
                                assert.isFalse(true, "expected to get success");
                                done();
                            });
                });

                describe("в случае успеха возвращает ссылку на канал", function () {

                    it("ссылка на первый канал в списке каналов", function (done) {
                        if (channelList.length > 1 || channelList[0][1] != "ПУСТО") {
                            client.getChannelLink(channelList[0][0]).then(
                                    function (link) {
                                        assert.isString(link);
                                    },
                                    function (error) {
                                        assert.isFalse(true, "expected not to see this error");
                                    }).always(
                                    function () {
                                        done();
                                    });
                        } else {
                            assert.isFalse(true, "expected to get channel list");
                        }
                    });

                    it("ссылка на шестой канал в списке каналов", function (done) {
                        if (channelList.length > 5) {
                            client.getChannelLink(channelList[5][0]).then(
                                    function (link) {
                                        assert.isString(link);
                                    },
                                    function (error) {
                                        assert.isFalse(true, "expected not to see this error");
                                    }).always(
                                    function () {
                                        done();
                                    });
                        } else {
                            assert.isFalse(true, "expected to have 6-th channel in channel list");
                        }
                    });

                });

                describe("в случае неудачи должна вернуться ошибка", function () {

                    it("если задан не доступный канал", function (done) {
                        client.getChannelLink(12345).then(
                                function () {
                                    assert.isFalse(true, "expected not to get link");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("если задан канал с неправильным id (string 'some_id')", function (done) {
                        client.getChannelLink("some_id").then(
                                function () {
                                    assert.isFalse(true, "expected not to get link");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("если задан канал с неправильным id (undefined, как в пустом списке каналов)", function (done) {
                        client.getChannelLink(undefined).then(
                                function () {
                                    assert.isFalse(true, "expected not to get link");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("если не задан канал", function (done) {
                        client.getChannelLink().then(
                                function () {
                                    assert.isFalse(true, "expected not to get link");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("если нет доступа (не инициализирован)", function (done) {
                        client = new StalkerClient();
                        client.getChannelLink(channelList[0][0]).then(
                                function () {
                                    assert.isFalse(true, "expected not to get link");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

            });

            describe("#getGenres", function () {

                before(function (done) {
                    client.init(initer).then(function () {
                        done();
                    });
                });

                describe("в случае успеха возвращает массив обектов жанров, обязательные для возвращения значения ID и Title", function () {

                    it("получение списка жанров", function () {
                        client.getGenres().then(function (data) {
                            for (var i = 0; i < data.length; i++) {
                                assert.property(data[i], "id");
                                assert.property(data[i], "title");
                            }
                        });
                    });

                });

                describe("в случае неудачи должна вернуться строка ошибки", function () {

                    it("запрос без инициализации", function (done) {
                        client = new StalkerClient();
                        client.getGenres().then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get data");
                                },
                                function (error) {
                                    assert.isString(error, "expected to get error");
                                }).always(
                                function () {
                                    done();
                                });

                    });

                });

            });

        });

        describe("Работа с избранным", function () {
            var channel;

            beforeEach(function (done) {
                initer = new initObject();
                client = new StalkerClient();
                initer.setMac("08-00-27-9B-3E-8c");
                
                client.init(initer).then(
                        function () {
                            client.getChannels().then(
                                    function (channels) {
                                        assert.isTrue(channels.length > 1 || channels[0][1] != "ПУСТО", "expected not empty channel list");
                                        assert.isArray(channels[0], "expected to get channel info array");
                                        channel = channels[0];
                                    },
                                    function () {
                                        assert.isFalse(true, "expected to get channel");
                                    }).always(
                                    function () {
                                        done();
                                    });
                        },
                        function () {
                            assert.isFalse(true, "expected to get init");
                            done();
                        });
            });

            describe("#addFavorite, аргумент - channelObject", function () {

                describe("в случае успеха канал должен быть добавлен в избранное", function () {

                    it("если канал ещё не в списке избранного", function (done) {

                        client.addFavorite(channel[0]).then(
                                function (response) {
                                    assert.isTrue(response, "expected channel added to favorite");
                                },
                                function () {
                                    assert.isFalse(true, "expected to add to favorites");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("если канал уже в избранном", function (done) {

                        client.addFavorite(channel[0]).then(
                                function (response) {
                                    assert.isTrue(response, "expected channel added to favorite");
                                },
                                function () {
                                    assert.isFalse(true, "expected to add to favorites");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

                describe("в случае неудачи должна вернуться ошибка", function () {

                    it("если инициализация не прошла", function (done) {
                        client = new StalkerClient();
                        client.addFavorite(channel[0]).then(
                                function () {
                                    assert.isFalse(true, 'expected to get error');
                                },
                                function (error) {
                                    assert.isString(error, "expected to get error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

            });

            describe("#deleteFavorite, аргумент - channelObject", function () {

                describe("в случае успеха канал должен быть убран из избранного", function () {

                    it("если канал в списке избранного", function (done) {
                        client.deleteFavorite(channel[0]).then(
                                function (response) {
                                    assert.isTrue(response, "expected channel removed from favorite");
                                },
                                function () {
                                    assert.isFalse(true, "expected to remove from favorites");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

                describe("в случае неудачи должна вернуться ошибка", function () {

                    it("если канал уже не в избранном", function (done) {
                        client.deleteFavorite(channel[0]).then(
                                function () {
                                    assert.isFalse(true, "expected getting error");
                                },
                                function (error) {
                                    assert.isString(error, "expected getting error");
                                }).always(function () {
                            done();
                        });
                    });

                    it("если инициализация не прошла", function (done) {
                        client = new StalkerClient();
                        client.deleteFavorite(channel).then(
                                function () {
                                    assert.isFalse(true, 'expected to get error');
                                },
                                function (error) {
                                    assert.isString(error, "expected to get error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

            });

        });

    });

});