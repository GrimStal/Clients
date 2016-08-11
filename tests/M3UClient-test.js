/* 
 * Connecting to StalkerPortal libruary
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

describe("Клиенты", function () {

    describe(M3UClient.name, function () {

        var initer;
        var client;

        describe("Инициализация", function () {

            describe("#init, аргумент - объект initObject", function () {

                describe("При инициализации происходит подключение к серверу, указанному в InitObject", function () {

                    beforeEach(function () {
                        initer = new initObject();
                        client = new M3UClient();
                    });

                    it("подключение на основании адреса 'http://172.17.23.53:280/iptv18.m3u'", function (done) {
                        initer.setM3U("http://172.17.23.53:280/iptv18.m3u");
                        client.init(initer).always(function () {
                            assert.isTrue(client._inited);
                            done();
                        });
                    });

                });

                describe("В случаях ошибок инициализация не производится", function () {

                    beforeEach(function () {
                        initer = new initObject();
                        client = new M3UClient();
                    });

                    it("Адрес не задан", function (done) {
                        client.init(initer).always(function () {
                            assert.isFalse(client._inited);
                            done();
                        });
                    });

                });

            });

        });

        describe("Работа с каналами", function () {

            before(function () {
                initer = new initObject();
                client = new M3UClient();
                initer.setM3U("http://172.17.23.53:280/iptv18.m3u");
                initer.setEPG("http://172.17.23.53:280/xmltv.xml");
            });

            describe("#getChannels, аргументы - genre_id, onlyFavotite (возможно в будущем). Избранное не поддерживается ", function () {

                before(function (done) {
                    client.init(initer).then(function () {
                        done();
                    });
                });

                describe("в случае успеха, результатом должен быть массив channelObject'ов", function () {

                    it("Список каналов не задавая жанр", function (done) {
                        client.getChannels().then(
                                function (data) {
                                    assert.isArray(data, "must be an array");
                                    for (var i = 0; i < data.length; i++) {
                                        assert.instanceOf(data[i], channelObject, "must be instance of ChannelObject")
                                    }
                                },
                                function () {
                                    assert.isFalse(true, "expected not to see an error");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("Список каналов жанра 'НОВОСТИ'", function (done) {
                        client.getChannels('НОВОСТИ').then(
                                function (data) {
                                    assert.isArray(data, "must be an array");
                                    for (var i = 0; i < data.length; i++) {
                                        assert.instanceOf(data[i], channelObject, "must be instance of ChannelObject")
                                    }
                                    if (data.length > 1 || data[0].name != "ПУСТО") {
                                        for (var i = 0; i < data.length; i++) {
                                            assert.equal(data[i].groupTitle, 'НОВОСТИ', "expected to see only news");
                                        }
                                    }
                                },
                                function () {
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

                    it("запрос каналов без инициализации", function (done) {
                        client = new M3UClient();
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
                        client = new M3UClient();
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

        describe("#getChannelLink, аргумент - channelObject", function () {

            var channelList;

            before(function (done) {
                client.init(initer).then(
                        function () {
                            client.getChannels().then(
                                    function (channels) {
                                        channelList = channels;
                                    },
                                    function (error) {
                                        assert.isFalse(true, "expected to get channels");
                                    }).always(
                                    function () {
                                        done();
                                    });

                        });
            });

            describe("в случае успеха возвращает ссылку на канал", function () {

                it("ссылка на первый канал в списке каналов", function (done) {
                    client.getChannelLink(channelList[0]).then(
                            function (link) {
                                assert.isString(link);
                            },
                            function (error) {
                                assert.isFalse(true, "expected not to see this error");
                            }).always(
                            function () {
                                done();
                            });
                });

                it("ссылка на шестой канал в списке каналов", function (done) {
                    if (channelList.length > 5) {
                        client.getChannelLink(channelList[5]).then(
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
                    client.getChannelLink({name: "Some channel", channelID: 12345}).then(
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
                    client.getChannelLink({name: "Some channel", channelID: "some_id"}).then(
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

                it("если задан канал с неправильным id (null, как в пустом списке каналов)", function (done) {
                    client.getChannelLink({name: "Some channel", channelID: null}).then(
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
                    client = new M3UClient();
                    client.getChannelLink({name: "Some channel", channelID: 999}).then(
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

        describe("#getEPG, аргументы - channelObject и amount. Не поддерживается", function () {

            var channel;

            before(function (done) {
                client.init(initer).then(
                        function () {
                            client.getChannels().then(
                                    function (channels) {
                                        channel = channels[0];
                                        for (var i = 0; i < channels.length; i++) {
                                            if (channels[i].name.toLowerCase() == "россия 24") {
                                                channel = channels[i];
                                                break;
                                            }
                                        }
                                        assert.isNotNull(channel.tvgName);
                                    },
                                    function (error) {
                                        assert.isTrue(client._authData.isLogin());
                                        assert.isFalse(true, "expected to get channels");
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

////            describe("в случае успеха должна вернуться телепрограмма для " +
////                    "заданного канала в указанном кол-ве, включая текущую", function () {
////
////                        it("текущая телепрограмма", function (done) {
////                            client.getEPG(channel, 1).then(
////                                    function (data) {
////                                        assert.isArray(data, "expected array of epgObjects");
////                                        assert.equal(data.length, 1, "expected only pending tv-programm");
////                                        assert.instanceOf(data[0], epgObject);
////                                    },
////                                    function (error) {
////                                        assert.isFalse(true, "expected to not get this error:" + error);
////                                    }).always(
////                                    function () {
////                                        done();
////                                    });
////                        });
////
////                        it("телепрограмма на 3 передачи", function (done) {
////                            client.getEPG(channel, 3).then(
////                                    function (data) {
////                                        assert.isArray(data, "expected array of epgObjects");
////                                        assert.equal(data.length, 3, "expected only pending tv-programm");
////                                        for (var i = 0; i < data.length; i++) {
////                                            assert.instanceOf(data[i], epgObject);
////                                        }
////                                    },
////                                    function (error) {
////                                        assert.isFalse(true, "expected to not get this error");
////                                    }).always(
////                                    function () {
////                                        done();
////                                    });
////                        });
////
////                    });
//
//            describe("в случае отсутствия телепрограммы должен вернуться пустой массив", function () {
//
//                before(function () {
//                    channel.tvgName = 208;  //у этого канала нет телепрограммы
//                });
//
//                it("текущая телепрограмма для канала, у которого её нет", function (done) {
//                    client.getEPG(channel, 1).then(
//                            function (data) {
//                                assert.isArray(data, "expected to have array");
//                                assert.equal(data.length, 0, "expect missing epg");
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected not to see this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//                it("телепрограмма на 3 программы для канала, у которого её нет", function (done) {
//                    client.getEPG(channel, 3).then(
//                            function (data) {
//                                assert.isArray(data, "expected to have array");
//                                assert.equal(data.length, 0, "expect missing epg");
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected not to see this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//            });

            describe("функция не поддерживается и всегда возвращает ошибку", function () {

                describe("в случае существующего канала", function () {

//                    before(function () {
//                        channel.tvgName = 999; //такого канала в базе нет
//                    });

                    it("текущая телепрограмма", function (done) {
                        client.getEPG(channel, 1).then(
                                function (data) {
                                    assert.isFalse(true, "expected to get fail");
                                },
                                function (error) {
                                    assert.isString(error, "expected to have a mistake");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("телепрограмма на 3 программы", function (done) {
                        client.getEPG(channel, 3).then(
                                function (data) {
                                    assert.isFalse(true, "expected to get fail");
                                },
                                function (error) {
                                    assert.isString(error, "expected to have a mistake");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

                describe("в случае отсутствия инициализации", function () {

                    before(function () {
                        client = new M3UClient();
                    });

                    it("текущая телепрограмма", function (done) {
                        client.getEPG(channel, 1).then(
                                function (data) {
                                    assert.isFalse(true, "expected to get fail");
                                },
                                function (error) {
                                    assert.isString(error, "expected to have a mistake");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("телепрограмма на 3 программы", function (done) {
                        client.getEPG(channel, 3).then(
                                function (data) {
                                    assert.isFalse(true, "expected to get fail");
                                },
                                function (error) {
                                    assert.isString(error, "expected to have a mistake");
                                }).always(
                                function () {
                                    done();
                                });

                    });

                });

            });

        });

        describe("#getEPGForDate, аргументы - channelObject и date. Не поддерживается", function () {

            var channel;

            before(function (done) {
                client.init(initer).then(
                        function () {
                            client.getChannels().then(
                                    function (channels) {
                                        channel = channels[0];
                                        assert.isNotNull(channel.tvgName);
                                    },
                                    function (error) {
                                        assert.isTrue(client._authData.isLogin());
                                        assert.isFalse(true, "expected to get channels");
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

//            describe("в случае успеха должна вернуться вся телепрограмма для указанного канала на указанную дату", function () {
//
//                it("телепрограмма на сегодня", function (done) {
//                    var tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, 0, 0, 0) / 1000;
//                    client.getEPGForDate(channel, new Date()).then(
//                            function (data) {
//                                assert.isArray(data, "expected array of epgObjects");
//                                assert.isTrue(data.length >= 1, "expected only pending tv-programm");
//                                for (var i = 0; i < data.length; i++) {
//                                    assert.instanceOf(data[i], epgObject);
//                                }
//                                assert.isTrue(data[0].endTime >= new Date().setHours(0, 0, 0, 0) / 1000, "expected first epg start after day start");
//                                assert.isTrue(data[data.length - 1].startTime < tomorrow);
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected to not get this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//                it("телепрограмма на послезавтра", function (done) {
//                    var tomorrow = new Date(new Date().setDate(new Date().getDate() + 3)).setHours(0, 0, 0, 0) / 1000; //сдвиг 2 часа из-за нашего часового пояса
//                    var today = new Date(new Date().setDate(new Date().getDate() + 2));
//                    client.getEPGForDate(channel, today).then(
//                            function (data) {
//                                assert.isArray(data, "expected array of epgObjects");
//                                assert.isTrue(data.length >= 1, "expected only pending tv-programm");
//                                for (var i = 0; i < data.length; i++) {
//                                    assert.instanceOf(data[i], epgObject);
//                                }
//                                assert.isTrue(data[0].endTime >= today.setHours(0, 0, 0, 0) / 1000, "expected first epg start after day start");
//                                assert.isTrue(data[data.length - 1].startTime < tomorrow);
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected to not get this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//            });
//
//            describe("в случае отсутствия телепрограммы должен вернуться пустой массив", function () {
//
//                before(function () {
//                    channel.tvgName = 208;
//                });
//
//                it("телепрограмма на сегодня", function (done) {
//                    client.getEPGForDate(channel, new Date()).then(
//                            function (data) {
//                                assert.isArray(data, "expected array of epgObjects");
//                                assert.isTrue(data.length == 0, "expected empty array");
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected to not get this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//                it("телепрограмма на послезавтра", function (done) {
//                    var today = new Date(new Date().setDate(new Date().getDate() + 2));
//                    client.getEPGForDate(channel, today).then(
//                            function (data) {
//                                assert.isArray(data, "expected array of epgObjects");
//                                assert.isTrue(data.length == 0, "expected empty array");
//                            },
//                            function (error) {
//                                assert.isFalse(true, "expected to not get this error");
//                            }).always(
//                            function () {
//                                done();
//                            });
//                });
//
//            });

            describe("Функция не поддерживается и всегда возвращает ошибку", function () {

                describe("существующий канал", function () {

//                    before(function () {
//                        channel.tvgName = 999;
//                    });

                    it("телепрограмма на сегодня", function (done) {
                        client.getEPGForDate(channel, new Date()).then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get data");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("телепрограмма на послезавтра", function (done) {
                        var today = new Date(new Date().setDate(new Date().getDate() + 2));
                        client.getEPGForDate(channel, today).then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get data");
                                },
                                function (error) {
                                    assert.isString(error, "expected to get string");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

                describe("инициализация не пройдена", function () {

                    before(function () {
                        client = new M3UClient();
                    });

                    it("телепрограмма на сегодня", function (done) {
                        client.getEPGForDate(channel, new Date()).then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get data");
                                },
                                function (error) {
                                    assert.isString(error);
                                }).always(
                                function () {
                                    done();
                                });
                    });

                    it("телепрограмма на послезавтра", function (done) {
                        var today = new Date(new Date().setDate(new Date().getDate() + 2));
                        client.getEPGForDate(channel, today).then(
                                function (data) {
                                    assert.isFalse(true, "expected not to get data");
                                },
                                function (error) {
                                    assert.isString(error, "expected to get string");
                                }).always(
                                function () {
                                    done();
                                });
                    });

                });

            });

        });

    });

    describe("Работа с избранным", function () {
        var initer;
        var client;
        var channel;
        /**
         * Checks the channel for selected favorite status 0 or 1
         * @param {boolean} num
         * @returns {undefined}
         */
        function checkChannel(num, done) {
            var channelID = channel.channelID;
            var selectedChannel;
            client.getChannels().then(
                    function (channels) {
                        assert.isTrue(channels.length > 0, "expected to get channels");
                        for (var i = 0; i < channels.length; i++) {
                            if (channels[i].channelID == channelID) {
                                selectedChannel = channels[i];
                                break;
                            }
                        }
                        assert.isDefined(selectedChannel, "expected to get channel which was added to/removed from favorite");
                        assert.equal(selectedChannel.favorite, num, "expected channel still not favorite");
                    },
                    function () {
                        assert.isFalse(true, "expected to get channels");
                    }).always(
                    function () {
                        done();
                    });
        }

        function workWithFavorite(done) {
            client.init(initer).then(
                    function () {
                        client.getChannels().then(
                                function (channels) {
                                    channel = channels[0];
                                    assert.instanceOf(channel, channelObject);
                                    assert.isNotNull(channel.channelID, "expected to get valid channel");
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
        }

        before(function () {
            initer = new initObject();
            client = new M3UClient();
            initer.setM3U("http://172.17.23.53:280/iptv18.m3u");
        });

        beforeEach(function (done) {
            workWithFavorite(done);
        });

        describe("#addFavorite, аргумент - channelObject. Не поддерживается", function () {

//            describe("в случае успеха канал должен быть добавлен в избранное", function () {
//
//                it("если канал ещё не в списке избранного", function (done) {
//                    assert.equal(channel.favorite, 0, "expected channel is not in favorite");
//
//                    client.addFavorite(channel).then(
//                            function () {
//                                checkChannel(1, done);
//                            },
//                            function () {
//                                assert.isFalse(true, "expected to add to favorites");
//                                done();
//                            });
//                });
//
//                it("если канал уже в избранном", function (done) {
//                    assert.equal(channel.favorite, 1, "expected channel is favorite");
//
//                    client.addFavorite(channel).then(
//                            function () {
//                                checkChannel(1, done);
//                            },
//                            function () {
//                                assert.isFalse(true, "expected to add to favorites");
//                                done();
//                            });
//                });
//
//            });

            describe("Функция не поддерживается и всегда возвращает false в успешном выполнении", function () {

                it("с инициализацией всё в порядке", function (done) {
                    client.addFavorite(channel).then(
                            function (data) {
                                assert.isFalse(data, "expected to get false");
                            },
                            function (error) {
                                assert.isFalse(true, "expected to get success");
                            }).always(
                            function () {
                                done();
                            });
                });

                it("если инициализация не прошла", function (done) {
                    client = new M3UClient();
                    client.addFavorite(channel).then(
                            function (data) {
                                assert.isFalse(data, 'expected to get false');
                            },
                            function (error) {
                                assert.isString(error, "expected to get success");
                            }).always(
                            function () {
                                done();
                            });
                });

            });

        });

        describe("#deleteFavorite, аргумент - channelObject. Не поддерживается", function () {

//            describe("в случае успеха канал должен быть убран из избранного", function () {
//
//                it("если канал в списке избранного", function (done) {
//                    assert.equal(channel.favorite, 1, "expected channel is favorite");
//                    client.deleteFavorite(channel).then(
//                            function () {
//                                checkChannel(0, done);
//                            },
//                            function () {
//                                assert.isFalse(true, "expected to add to favorites");
//                                done();
//                            });
//                });
//
//            });

            describe("Функция не поддерживается и всегда возвращает false в успешном выполнении", function () {

                it("инициализировано", function (done) {
                    client.deleteFavorite(channel).then(
                            function (data) {
                                assert.isFalse(data, "expected getting false");
                                done();
                            },
                            function (error) {
                                assert.isFalse(true, "expected getting success");
                            });
                });

                it("если инициализация не прошла", function (done) {
                    client = new M3UClient();
                    client.deleteFavorite(channel).then(
                            function (data) {
                                assert.isFalse(data, 'expected to get false');
                            },
                            function (error) {
                                assert.isFalse(true, "expected to get success");
                            }).always(
                            function () {
                                done();
                            });
                });

            });

        });

    });

});