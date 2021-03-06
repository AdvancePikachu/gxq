var fileUploadAddress = _GATE_URL + "/api/file";  //todo _GATE_URL的值根据自身情况替换

function getUrl(uri) {
    return fileUploadAddress + '/p/file/' + uri;
}

var userId= 0;//todo 用户id根据自身情况替换

function getHeaders() {//todo token的值根据自身情况替换
    return {
        token: $.cookie("_token")
    };
}

var uploader;

function FileUpload(obj) {
    (function ($) {
        // 当domReady的时候开始初始化
        $(function () {
            var $wrap = $('#' + obj.uploader),

                // 图片容器
                $queue = $('<ul class="filelist"></ul>')
                    .appendTo($wrap.find('.queueList')),

                // 状态栏，包括进度和控制按钮
                $statusBar = $wrap.find('.statusBar'),

                // 文件总体选择信息。
                $info = $statusBar.find('.info'),

                // 上传按钮
                $upload = $wrap.find('.uploadBtn'),

                // 没选择文件之前的内容。
                $placeHolder = $wrap.find('.placeholder'),

                $progress = $statusBar.find('.progress').hide(),

                // 添加的文件数量
                fileCount = 0,

                // 添加的文件总大小
                fileSize = 0,

                // 优化retina, 在retina下这个值是2
                ratio = window.devicePixelRatio || 1,

                // 缩略图大小
                thumbnailWidth = 110 * ratio,
                thumbnailHeight = 110 * ratio,

                // 可能有pedding, ready, uploading, confirm, done.
                state = 'pedding',

                // 所有文件的进度信息，key为file id
                percentages = {},
                // 判断浏览器是否支持图片的base64
                isSupportBase64 = (function () {
                    var data = new Image();
                    var support = true;
                    data.onload = data.onerror = function () {
                        if (this.width != 1 || this.height != 1) {
                            support = false;
                        }
                    }
                    data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                    return support;
                })(),

                // 检测是否已经安装flash，检测flash的版本
                flashVersion = (function () {
                    var version;

                    try {
                        version = navigator.plugins['Shockwave Flash'];
                        version = version.description;
                    } catch (ex) {
                        try {
                            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                                .GetVariable('$version');
                        } catch (ex2) {
                            version = '0.0';
                        }
                    }
                    version = version.match(/\d+/g);
                    return parseFloat(version[0] + '.' + version[1], 10);
                })(),
                supportTransition = (function () {
                    var s = document.createElement('p').style,
                        r = 'transition' in s ||
                            'WebkitTransition' in s ||
                            'MozTransition' in s ||
                            'msTransition' in s ||
                            'OTransition' in s;
                    s = null;
                    return r;
                })(),

                // WebUploader实例
                uploader;

            if (!WebUploader.Uploader.support('flash') && WebUploader.browser.ie) {

                // flash 安装了但是版本过低。
                if (flashVersion) {
                    (function (container) {
                        window['expressinstallcallback'] = function (state) {
                            switch (state) {
                                case 'Download.Cancelled':
                                    alert('您取消了更新！')
                                    break;

                                case 'Download.Failed':
                                    alert('安装失败')
                                    break;

                                default:
                                    alert('安装已成功，请刷新！');
                                    break;
                            }
                            delete window['expressinstallcallback'];
                        };

                        var swf = './expressInstall.swf';
                        // insert flash object
                        var html = '<object type="application/' +
                            'x-shockwave-flash" data="' + swf + '" ';

                        if (WebUploader.browser.ie) {
                            html += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
                        }

                        html += 'width="100%" height="100%" style="outline:0">' +
                            '<param name="movie" value="' + swf + '" />' +
                            '<param name="wmode" value="transparent" />' +
                            '<param name="allowscriptaccess" value="sameDomain" />' +
                            '</object>';

                        container.html(html);
                    })($wrap);

                    // 压根就没有安转。
                } else {
                    $wrap.html('<a href="http://www.adobe.com/go/getflashplayer" target="_blank" border="0"><img alt="get flash player" src="http://www.adobe.com/macromedia/style_guide/images/160x41_Get_Flash_Player.jpg" /></a>');
                }

                return;
            } else if (!WebUploader.Uploader.support()) {
                alert('Web Uploader 不支持您的浏览器！');
                return;
            }
            var userInfo = {md5: ""};   //用户会话信息
            var chunkSize = 5 * 1000 * 1024;        //分块大小
            var uniqueFileName = null;          //文件唯一标识符

            WebUploader.Uploader.register({
                "before-send-file": "beforeSendFile"  //时间点1：所有分块进行上传之前调用此函数 ，检查文件存不存在
                , "before-send": "beforeSend"         //时间点2：如果有分块上传，则每个分块上传之前调用此函数  ，判断分块存不存在
                , "after-send-file": "afterSendFile"  //时间点3：分片上传完成后，通知后台合成分片
            },
                { beforeSendFile: function (file) {
                    console.log(file);
                    //秒传验证
                    var task = new $.Deferred();
                    var start = new Date().getTime();
                    (new WebUploader.Uploader()).md5File(file, 0, 10 * 1024 * 1024).progress(function (percentage) {
                        console.log(percentage);
                    }).then(function (val) {
                        console.log("总耗时: " + ((new Date().getTime()) - start) / 1000);
                        // md5Mark = val;
                        userInfo.md5 = val;
                        uploader.options.formData["md5"] = val
                        $.ajax({
                            type: "POST"
                            , url: getUrl('md5Check')
                            , data: {
                                md5: val,
                                userId: userId
                            }
                            , headers: getHeaders()
                            , cache: false
                             ,   async: false  // 同步
                            , dataType: "json"
                        }).then(function (data, textStatus, jqXHR) {
                            console.log(data);
                            if (data.errcode == 0) {
                                if (data.data) {   //若存在，这返回失败给WebUploader，表明该文件不需要上传
                                    task.reject();   //分片存在，跳过
                                    uploader.skipFile(file);
                                } else {
                                    task.resolve();   //分块不存在或不完整，重新发送该分块内容
                                    //拿到上传文件的唯一名称，用于断点续传  需要确保前后端的md5算法和参数一致
                                    uniqueFileName = md5('' + file.name + file.type + file.lastModifiedDate + file.size);
                                }
                            } else {
                                task.reject();   //报错， 跳过
                                alert(data.errmsg);
                            }

                        }, function (jqXHR, textStatus, errorThrown) {    //任何形式的验证失败，都触发重新上传
                            task.resolve();
                            //拿到上传文件的唯一名称，用于断点续传
                            uniqueFileName = md5('' + file.name + file.type + file.lastModifiedDate + file.size);
                        });
                    });
                    return $.when(task);
                }
                , beforeSend: function (block) {
                    //分片验证是否已传过，用于断点续传
                    var task = new $.Deferred();
                    $.ajax({
                        type: "POST"
                        , url: getUrl('chunkCheck')
                        , data: JSON.stringify({
                            name: uniqueFileName
                            , chunkIndex: block.chunk
                            , size: block.end - block.start
                        })
                        , headers: getHeaders()
                        , cache: false
                        , dataType: "json"
                        , contentType: "application/json",
                    }).then(function (data, textStatus, jqXHR) {
                        if (data.errcode == 0) {
                            if (data.data) {   //若存在，返回失败给WebUploader，表明该分块不需要上传
                                task.reject();
                            } else {
                                task.resolve();
                            }
                        } else {
                            task.reject();   //报错， 跳过
                            alert(data.errmsg);
                        }
                    }, function (jqXHR, textStatus, errorThrown) {    //任何形式的验证失败，都触发重新上传
                        task.resolve();
                    });
                    return $.when(task);
                }
                , afterSendFile: function (file) {
                    var chunksTotal = 0;
                    if ((chunksTotal = Math.ceil(file.size / chunkSize)) > 1) {
                        //合并请求
                        var task = new $.Deferred();
                        $.ajax({
                            type: "POST"
                            , url: getUrl('chunksMerge')
                            , data: JSON.stringify({
                                name: uniqueFileName
                                , chunks: chunksTotal
                                , ext: file.ext
                                , md5: userInfo.md5
                                , submittedFileName: file.name
                                , userId: userId
                            })
                            , headers: getHeaders()
                            , cache: false
                            , async: false  // 同步
                            , dataType: "json"
                            , contentType: "application/json",
                        }).then(function (data, textStatus, jqXHR) {
                            if (data.errcode == 0) {
                                task.resolve();
                            } else {
                                task.reject();   //报错， 跳过
                                alert(data.errmsg);
                            }
                        }, function (jqXHR, textStatus, errorThrown) {
                            task.reject();
                        });
                        return $.when(task);
                    } else {
                    }
                }
            });

            // 实例化
            uploader = WebUploader.create({
                pick: {
                    id: '#' + obj.filePicker,
                    label: '选择文件'
                },
                formData: $.extend(true, {
                    userId: userId
                }, userInfo),
                resize: false,
                headers: getHeaders(),
                dnd: '#' + obj.dndArea,
                paste: '#' + obj.uploader,
                swf: '${_js}/webuploader2/images/Uploader.swf',
                chunked: true,
                chunkSize: chunkSize,
                server: getUrl('chunkUpload'),
                // runtimeOrder: 'flash',

                // accept: {
                //     title: 'Images',
                //     extensions: 'gif,jpg,jpeg,bmp,png',
                //     mimeTypes: 'image/*'
                // },

                // 禁掉全局的拖拽功能。这样不会出现图片拖进页面的时候，把图片打开。
                disableGlobalDnd: true,
                fileNumLimit: 1,
                fileSizeLimit: 256 * 1024 * 1024,    // 256M
                duplicate: true
            });


            // 拖拽时不接受 js, txt 文件。
            uploader.on('dndAccept', function (items) {
                var denied = false,
                    len = items.length,
                    i = 0,
                    // 修改js类型
                    unAllowed = 'text/plain;application/javascript ';

                for (; i < len; i++) {
                    // 如果在列表里面
                    if (~unAllowed.indexOf(items[i].type)) {
                        denied = true;
                        break;
                    }
                }

                return !denied;
            });
            uploader.on('dialogOpen', function () {
                console.log('here');
            });

            // 添加“添加文件”的按钮，
            /*uploader.addButton({
                id: '#'+obj.jxButton,
                label: '继续添加'
            });*/

            uploader.on('ready', function () {
                window.uploader = uploader;
            });
            uploader.on('fileQueued', function (file) {
                // // 返回的是 promise 对象
                // this.md5File(file, 0, 1 * 1024 * 1024)
                // // 可以用来监听进度
                //     .progress(function (percentage) {
                //         // console.log('Percentage:', percentage);
                //     })
                //     // 处理完成后触发
                //     .then(function (ret) {
                //         var fileName = file.name;
                //         console.log(fileName + '-md5:', ret);
                //         uploader.options.formData[fileName] = ret;
                //     });
            });

            // 当有文件添加进来时执行，负责view的创建
            function addFile(file) {
                $("#file_html").html("");
                var fileNameS = file.name.split(".");
                fileNameS.pop();
                var fileName = fileNameS.join();
                var $li = $('<li id="' + file.id + '" >' +
                    '<p class="imgWrap"></p>' +
                    '<p class="wrapSize"></p>' +
                    '</li>'),

                    $btns = $('<div class="file-panel">' +
                        '<span class="cancel">删除</span></div>');
                $prgress = $li.find('p.progress span'),
                    $wrap = $li.find('p.imgWrap'),
                    $wrapSize = $li.find('p.wrapSize'),
                    // $info = $('<p class="error"></p>'),
                    $removeBtns = '',
                    showError = function (code) {
                        switch (code) {
                            case 'exceed_size':
                                text = '文件大小超出';
                                break;

                            case 'interrupt':
                                text = '上传暂停';
                                break;

                            default:
                                text = '上传失败，请重试';
                                break;
                        }

                        $info.text(text).appendTo($li);
                    };

                if (file.getStatus() === 'invalid') {
                    showError(file.statusText);
                } else {
                    // @todo lazyload
                    $wrap.text('预览中');
                    // uploader.makeThumb( file, function( error, src ) {
                    var name = file.name;
                    $wrap.text(name);
                    var size = WebUploader.formatSize(file.size);
                    $wrapSize.text(size);
                    $wrap.append('<span class="fa fa-close pull-right cancel fa-img"></span>');
                    $removeBtns = $($($wrap).find('.cancel'));
                    $removeBtns.on('click', function () {
                        uploader.removeFile(file);
                    });
                    // }, thumbnailWidth, thumbnailHeight );

                    percentages[file.id] = [file.size, 0];
                    file.rotation = 0;
                }

                file.on('statuschange', function (cur, prev) {
                    if (prev === 'progress') {
                        $prgress.hide().width(0);
                    } else if (prev === 'queued') {
                        //$li.off( 'mouseenter mouseleave' );
                        //$btns.remove();
                    }

                    // 成功
                    if (cur === 'error' || cur === 'invalid') {
                        console.log(file.statusText);
                        showError(file.statusText);
                        percentages[file.id][1] = 1;
                    } else if (cur === 'interrupt') {
                        showError('interrupt');
                    } else if (cur === 'queued') {
                        $info.remove();
                        $prgress.css('display', 'block');
                        percentages[file.id][1] = 0;
                    } else if (cur === 'progress') {
                        $info.remove();
                        $prgress.css('display', 'block');
                    } else if (cur === 'complete') {
                        $prgress.hide().width(0);
                        $li.append('<span class="success"></span>');
                    }

                    $li.removeClass('state-' + prev).addClass('state-' + cur);
                });

                $li.on('mouseenter', function () {
                    $btns.stop().animate({height: 30});
                });

                $li.on('mouseleave', function () {
                    $btns.stop().animate({height: 0});
                });

                $btns.on('click', 'span', function () {
                    var index = $(this).index(),
                        deg;

                    switch (index) {
                        case 0:
                            uploader.removeFile(file);
                            return;

                        case 1:
                            file.rotation += 90;
                            break;

                        case 2:
                            file.rotation -= 90;
                            break;
                    }

                    if (supportTransition) {
                        deg = 'rotate(' + file.rotation + 'deg)';
                        $wrap.css({
                            '-webkit-transform': deg,
                            '-mos-transform': deg,
                            '-o-transform': deg,
                            'transform': deg
                        });
                    } else {
                        $wrap.css('filter', 'progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (~~((file.rotation / 90) % 4 + 4) % 4) + ')');
                        // use jquery animate to rotation
                        // $({
                        //     rotation: rotation
                        // }).animate({
                        //     rotation: file.rotation
                        // }, {
                        //     easing: 'linear',
                        //     step: function( now ) {
                        //         now = now * Math.PI / 180;

                        //         var cos = Math.cos( now ),
                        //             sin = Math.sin( now );

                        //         $wrap.css( 'filter', "progid:DXImageTransform.Microsoft.Matrix(M11=" + cos + ",M12=" + (-sin) + ",M21=" + sin + ",M22=" + cos + ",SizingMethod='auto expand')");
                        //     }
                        // });
                    }


                });

                $li.appendTo($queue);
            }

            // 负责view的销毁
            function removeFile(file) {
                var $li = $('#' + file.id);
                var siblings = $($li).siblings();
                if ($(siblings).length == 0) {
                    $("#file_html").html("<li>还未选择文件</li>");
                }
                delete percentages[file.id];
                updateTotalProgress();
                $li.off().find('.file-panel').off().end().remove();
                if (typeof deleteFile === 'function') {
                    if (file.fileId)
                        deleteFile(file.fileId);
                }
            }

            function updateTotalProgress() {
                var loaded = 0,
                    total = 0,
                    spans = $progress.children(),
                    percent;

                $.each(percentages, function (k, v) {
                    total += v[0];
                    loaded += v[0] * v[1];
                });

                percent = total ? loaded / total : 0;


                spans.eq(0).text(Math.round(percent * 100) + '%');
                spans.eq(1).css('width', Math.round(percent * 100) + '%');
                updateStatus();
            }

            function updateStatus() {
                var text = '';
                var stats;
                if (state === 'ready') {
                    text = '选中' + fileCount + '个文件，共' + WebUploader.formatSize(fileSize) + '。';
                } else if (state === 'confirm') {
                    stats = uploader.getStats();
                    if (stats.uploadFailNum) {
                        text = '已成功上传' + stats.successNum + '个文件，' +
                            stats.uploadFailNum + '个文件传失败，<a class="retry" href="#">重新上传</a>失败文件或<a class="ignore" href="#">忽略</a>'
                    }

                } else {
                    stats = uploader.getStats();
                    text = '共' + fileCount + '个（' +
                        WebUploader.formatSize(fileSize, 2) +
                        '），已上传' + stats.successNum + '个';

                    if (stats.uploadFailNum) {
                        text += '，失败' + stats.uploadFailNum + '个';
                    }
                }

                $info.html(text);
            }

            function setState(val) {
                var file, stats;

                if (val === state) {
                    return;
                }

                $upload.removeClass('state-' + state);
                $upload.addClass('state-' + val);
                state = val;

                switch (state) {
                    case 'pedding':
                        $placeHolder.removeClass('element-invisible');
                        $queue.hide();
                        $statusBar.addClass('element-invisible');
                        uploader.refresh();
                        break;

                    case 'ready':
                        $placeHolder.addClass('element-invisible');
                        $('#filePicker2').removeClass('element-invisible');
                        $queue.show();
                        $statusBar.removeClass('element-invisible');
                        uploader.refresh();
                        break;

                    case 'uploading':
                        $('#filePicker2').addClass('element-invisible');
                        $progress.show();
                        // $upload.text( '暂停上传' );
                        $upload.text('');
                        break;

                    case 'paused':
                        $progress.show();
                        // $upload.text( '继续上传' );
                        $upload.text('');
                        break;

                    case 'confirm':
                        $progress.hide();
                        $('#filePicker2').removeClass('element-invisible');
                        // $upload.text( '开始上传' );
                        $upload.text('');

                        stats = uploader.getStats();
                        if (stats.successNum && !stats.uploadFailNum) {
                            setState('finish');
                            return;
                        }
                        break;
                    case 'finish':
                        //TODO 上传成功回调。  这里需要根据自身情况调整
                        stats = uploader.getStats();
                        if (stats.successNum) {
                            if (typeof parent.home.updateFolder == "function") {
                                if (typeof parent.home.parm == "object") {
                                    parent.home.parm.pageNo = 1;
                                }
                                parent.home.updateFolder(obj.folderId);
                            }
                            var idnex = parent.layer.index;
                            parent.layer.msg('上传成功');
                            parent.layer.close(idnex);

                            var index = parent.layer.getFrameIndex(window.name);
                            parent.layer.close(index);
                        } else {
                            // 没有成功的图片，重设
                            state = 'done';
                            location.reload();
                        }
                        break;
                }

                updateStatus();
            }

            uploader.onUploadProgress = function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress span');

                $percent.css('width', percentage * 100 + '%');
                percentages[file.id][1] = percentage;
                updateTotalProgress();
            };

            uploader.onFileQueued = function (file) {
                fileCount++;
                fileSize += file.size;

                if (fileCount === 1) {
                    $placeHolder.addClass('element-invisible');
                    $statusBar.show();
                }

                addFile(file);
                setState('ready');
                updateTotalProgress();
            };

            uploader.onFileDequeued = function (file) {
                fileCount--;
                fileSize -= file.size;

                if (!fileCount) {
                    setState('pedding');
                }

                removeFile(file);
                updateTotalProgress();

            };
            uploader.onUploadAccept = function (file, json) {//后台返回参数
                if (obj.dateNode) {
                    var dateNodeVal = $("#" + obj.dateNode).val();
                    if (dateNodeVal) {
                        json.dateNodeVal = dateNodeVal;
                    }
                }
                //file.file.fileId=json.fileInfo.id;
                if (typeof successUpload === 'function') {
                    successUpload(json);
                }
            };
            uploader.on('all', function (type) {
                var stats;
                switch (type) {
                    case 'uploadFinished':
                        setState('confirm');
                        break;

                    case 'startUpload':
                        setState('uploading');
                        break;

                    case 'stopUpload':
                        setState('paused');
                        break;

                }
            });

            uploader.onError = function (code) {
                if (code == "F_DUPLICATE") {
                    code = "请不要重复上传文件！";
                }
                if (code == "Q_EXCEED_SIZE_LIMIT") {
                    code = "单个文件大小不能超过256M！";
                }
                if (code == "F_EXCEED_SIZE") {
                    code = "一次最多只能上传2G大小的文件！";
                }
                if (code == "Q_EXCEED_NUM_LIMIT") {
                    code = "超出文件个数限制！";
                }

                parent.layer.msg(code, {
                    time: 2000
                });
            };

            $upload.on('click', function () {
                if ($(this).hasClass('disabled')) {
                    return false;
                }

                if (state === 'ready') {
                    if (obj.dateNode) {
                        var dateNodeVal = $("#" + obj.dateNode).val();
                        if (!dateNodeVal) {
                            alert("请填写时间节点！");
                            return false;
                        }
                    }
                    uploader.upload();
                } else if (state === 'paused') {
                    uploader.upload();
                } else if (state === 'uploading') {
                    uploader.stop();
                }
            });

            $info.on('click', '.retry', function () {
                uploader.retry();
            });

            $info.on('click', '.ignore', function () {
                alert('todo');
            });

            $upload.addClass('state-' + state);
            updateTotalProgress();
        });

    })(jQuery);
}
