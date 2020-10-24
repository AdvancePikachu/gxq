var resourceJs = {
    _gate_url: "",
    _app_id: "",
    _user_id: "",
    buttonList: null,
    menuList: null,
    FIND_MENU_URL: function () {
        return this._gate_url + "/api/admin/p/resource/findcanoperatemenu";
    },
    FIND_BUTTON_URL: function () {
        return this._gate_url + "/api/admin/p/resource/findcanoperatebutton";
    },

    data: {},
    init: function (_gate_url, _app_id, _user_id) {
        //��ʼ������
        this._gate_url = _gate_url;
        this._app_id = _app_id;
        this._user_id = _user_id;
        return this;
    },
    /**
     * @param resource_code ��Դ����  [����]
     * @param group �˵����� ���õ�ʱ�����õ� [Ĭ�Ͽ�]
     * @param resourceId �˵�id ��ѯ�Զ��˵�id�µİ�ť ���Բ�����[Ĭ�Ͽգ�������]
     * @param cache �Ƿ����ò�ѯ���� Ĭ��true
     * @param display �Ƿ�������ʾ��ʽ [Ĭ��false]
     * @param btnHtml ��ťhtml [Ĭ�Ͽ�]
     * @param htmlInsert �Ƿ񽫰�ť���뵱ǰλ�� [Ĭ��false]
     * @param isReplace �Ƿ��滻��ť�е�ռλ�� [Ĭ��true]
     * @returns {Array}
     */
    containButton: function (settings) {
        if (!resourceJs._gate_url || !resourceJs._app_id || !resourceJs._user_id) {
            return '���ȵ���init��������ȷ���� _gate_url/ _app_id/ _user_id';
        }

        //��ѯ�û�ӵ�еİ�ť
        var isCache = true;
        if(settings['cache'] == null || typeof(settings['cache']) == "undefined" || settings['cache']){
            isCache = true;
        } else {
            isCache = false;
        }
        if(isCache && resourceJs.buttonList == null){
            var resourceParam = {
                "appId": resourceJs._app_id, "userId": resourceJs._user_id,
                "group": settings['group'], "resourceId":settings['resourceId'],
            };
            ajaxHengyun({
                type: "POST",
                async: false,
                url: resourceJs.FIND_BUTTON_URL(),
                data: JSON.stringify(resourceParam),
                datatype: "json",
                contentType: 'application/json',
                success: function (rows) {
                    if (rows.errcode == 0 && rows.data) {
                        resourceJs.buttonList = rows.data;
                    }
                }
            });
        }

        //�Ƿ��� ������ʾ��ʽ
        if (settings['display']) {
            for (var i = 0; i < resourceJs.buttonList.length; i++) {
                var resource = buttonList[i];
                if (resource['code'] == settings['resource_code']) {
                    return 'display:block;';
                }
            }
            return 'display:none;';
        }

        if (settings['btnHtml']) {
            var btnHtml = '';
            //�ж��Ƿ���ָ����Ȩ��code
            for (var i = 0; i < resourceJs.buttonList.length; i++) {
                var resource = resourceJs.buttonList[i];
                if (resource['code'] == settings['resource_code']) {
                    btnHtml = settings['btnHtml'];
                    // �滻ռλ��
                    var isReplace = settings['isReplace'];
                    if(isReplace == null || typeof(isReplace) == "undefined" || isReplace){
                        btnHtml = btnHtml.replace('{{name}}', resource['name']);
                        btnHtml = btnHtml.replace('{{icon}}', resource['icon']);
                        btnHtml = btnHtml.replace('{{url}}', resource['url']);
                    }
                    break;
                }
            }

            if (btnHtml) {// �ܽ������ʹ��������Ȩ��
                if (settings['htmlInsert']) {
                    $("#" + settings['resource_code']).after(btnHtml);
                }
            }
            return btnHtml;
        }

        return resourceJs.menuList;
    },
    findMenu: function (settings) {
        if (!resourceJs._gate_url || !resourceJs._app_id || !resourceJs._user_id) {
            return '���ȵ���init��������ȷ���� _gate_url/ _app_id/ _user_id';
        }

        //��ѯ�û�ӵ�еİ�ť
        //��ȡ�˵�
        var isCache = true;
        if(settings['cache'] == null || typeof(settings['cache']) == "undefined" || settings['cache']){
            isCache = true;
        } else {
            isCache = false;
        }
        if(isCache && resourceJs.menuList == null){
            var resourceParam = {
                "appId": resourceJs._app_id, "userId": resourceJs._user_id
            };
            ajaxHengyun({
                type: "POST",
                async: false,
                url: resourceJs.FIND_MENU_URL(),
                data: JSON.stringify(resourceParam),
                datatype: "json",
                contentType: 'application/json',
                success: function (rows) {
                    if (rows.errcode == 0 && rows.data) {
                        resourceJs.menuList = rows.data;
                    }
                }
            });
        }
        return resourceJs.menuList;
    },

};