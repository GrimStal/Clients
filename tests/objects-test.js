/* 
 * Connecting to StalkerPortal libruary
 * Borshchov Dimitriy (grimstal@bigmir.net)
 */

describe("Объекты", function () {

    describe("initObject", function () {

        describe("#setMac, входящие данные - 16-ный код из 12 символов разделенных ':' или '-'", function () {

            describe("В случае валидности входящих данных должно возвращать адрес в формате XX:XX:XX:XX:XX:XX", function () {

                it("Задание MAC адреса в формате 00-00-00-00-00-00", function () {
                    var initer = new initObject();
                    initer.setMac("00-00-00-00-00-00")
                    assert.equal(initer.mac, "00:00:00:00:00:00");
                });
                it("Задание MAC адреса в формате 00:00:00:00:00:00", function () {
                    var initer = new initObject();
                    initer.setMac("00:00:00:00:00:00")
                    assert.equal(initer.mac, "00:00:00:00:00:00");
                });
            });
            describe("В случае не валидности данных должно возвращать пустую строку", function () {

                it("Задание MAC адреса в формате 000000000000", function () {
                    var initer = new initObject();
                    initer.setMac("000000000000")
                    assert.equal(initer.mac, '');
                });
                it("Задание невалидного MAC (0t0000c000)", function () {
                    var initer = new initObject();
                    initer.setMac("0t0000c000")
                    assert.equal(initer.mac, '');
                });
                it("Задание невалидного MAC (0t-00-00-c0-00)", function () {
                    var initer = new initObject();
                    initer.setMac("0t-00-00-c0-00")
                    assert.equal(initer.mac, '');
                });
                it("Задание невалидного MAC (0t:00:00:c0:00)", function () {
                    var initer = new initObject();
                    initer.setMac("0t:00:00:c0:00")
                    assert.equal(initer.mac, '');
                });
            });
        });
    });
    describe("authObject", function () {

        var auth;
        describe("#set, в качестве аргумента выступает объект, полученный от Stalker", function () {

            beforeEach(function () {
                auth = new authObject();
            });
            it("проставляет переменные в объекте", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 8600});
                assert.isNotNull(auth.tokenType);
                assert.isNotNull(auth.accessToken);
                assert.isNotNull(auth.refreshToken);
                assert.isNotNull(auth.userID);
                assert.isNotNull(auth.expiresIn);
            });
            it("проставляются только заданные переменные", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", user_id: "54", expires_in: 8600});
                assert.isNotNull(auth.tokenType, "not null");
                assert.isNotNull(auth.accessToken, "not null");
                assert.isNull(auth.refreshToken, "null");
                assert.isNotNull(auth.userID, "not null");
                assert.isNotNull(auth.expiresIn, "not null");
            });
        });
        describe("#clear", function () {

            it("все переменные в объекте сбрасываются", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 8600});
                auth.clear();
                assert.isNull(auth.tokenType, "have to be null");
                assert.isNull(auth.accessToken, "have to be null");
                assert.isNull(auth.refreshToken, "have to be null");
                assert.isNull(auth.userID, "have to be null");
                assert.isNull(auth.expiresIn, "have to be null");
            });
        });
        describe("#isExpire", function () {

            beforeEach(function () {
                auth = new authObject();
            });
            it("ключ надо обновить (задано время жизни ключа 20 минут, время обновления 30)", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 1200});
                assert.isTrue(auth.isExpire());
            });
            it("ключ надо обновить (объект не задан)", function () {
                assert.isTrue(auth.isExpire());
            });
            it("ключ не нуждается в обновлении (задано время жизни ключа 40 минут, время обновления 30 минут)", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 2400});
                assert.isFalse(auth.isExpire());
            });
        });
        describe("#isLogin", function () {

            beforeEach(function () {
                auth = new authObject();
            });
            it("авторизация пройдена, обновление ключа не требуется", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 2400});
                assert.isTrue(auth.isLogin());
            });
            it("авторизация не пройдена", function () {
                assert.isFalse(auth.isLogin());
            });
            it("авторизация пройдена, но требуется обновление ключа", function () {
                auth.set({token_type: "Bearer", access_token: "54.2323434322dfsd", refresh_token: "dsjjker734rhndshfjdsdfs", user_id: "54", expires_in: 1200});
                assert.isFalse(auth.isLogin());
            });
        });
    });
    describe("channelObject", function () {

        var channelObj;
        describe("#set, аргументы name, url, channelID, image, tvgName, groupTitle, favorite", function () {

            beforeEach(function () {
                channelObj = new channelObject();
            });
            it("проставляет аргументы в объект", function () {
                channelObj.set("Первый канал", "udp://224.5.1.140:1234", "34", "/logo/logo1.png", "34", "Украинаские", "1");
                assert.isNotNull(channelObj.name);
                assert.isNotNull(channelObj.URL);
                assert.isNotNull(channelObj.channelID);
                assert.isNotNull(channelObj.image);
                assert.isNotNull(channelObj.tvgName);
                assert.isNotNull(channelObj.groupTitle);
                assert.notEqual(channelObj.favorite, 0);
            });
            it("проставляет только введенные аргументы", function () {
                channelObj.set("Первый канал", false, "34", "/logo/logo1.png", "34", "Украинаские");
                assert.isNotNull(channelObj.name);
                assert.isNull(channelObj.URL);
                assert.isNotNull(channelObj.channelID);
                assert.isNotNull(channelObj.image);
                assert.isNotNull(channelObj.tvgName);
                assert.isNotNull(channelObj.groupTitle);
                assert.equal(channelObj.favorite, 0);
            });
        });
    });
    describe("epgObject", function () {

        var epgObj;
        describe("#set, аргументы startTime(unixTimestamp), endTime(unixTimestamp), title, tvgName", function () {

            beforeEach(function () {
                epgObj = new epgObject();
            });
            it("проставляет аргументы в объект", function () {
                epgObj.set(1457949084, 1457949325, "Телепрограмма", "Новостные");
                assert.isNotNull(epgObj.startTime);
                assert.isNotNull(epgObj.endTime);
                assert.isNotNull(epgObj.title);
                assert.isNotNull(epgObj.tvgName);
            });
            it("проставляет только указанные аргументы", function () {
                epgObj.set(1457949084, 1457949325, "Телепрограмма");
                assert.isNotNull(epgObj.startTime);
                assert.isNotNull(epgObj.endTime);
                assert.isNotNull(epgObj.title);
                assert.isNull(epgObj.tvgName);
            });
            describe("если нет времени начала, времени окончания и названия, объект должен остаться пустым", function () {

                beforeEach(function () {
                    epgObj = new epgObject();
                });
                it("не указано название", function () {
                    epgObj.set(1457949084, 1457949325, false, "Новостные");
                    assert.isNull(epgObj.startTime);
                    assert.isNull(epgObj.endTime);
                    assert.isNull(epgObj.title);
                    assert.isNull(epgObj.tvgName);
                });
                it("не указано время начала", function () {
                    epgObj.set(false, 1457949325, "Новости");
                    assert.isNull(epgObj.startTime);
                    assert.isNull(epgObj.endTime);
                    assert.isNull(epgObj.title);
                    assert.isNull(epgObj.tvgName);
                });
                it("не указано время окончания", function () {
                    epgObj.set(1457949325, false, "Новости");
                    assert.isNull(epgObj.startTime);
                    assert.isNull(epgObj.endTime);
                    assert.isNull(epgObj.title);
                    assert.isNull(epgObj.tvgName);
                });
            });
        });
    });
});

