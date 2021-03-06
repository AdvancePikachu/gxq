/* eslint-disable */
import $ from './jquery-3.3.1.min.js'
import './config.js'
import store from '@/store'
window.hy_auth_login=function (){
	if(!loginConfig){
		
		console.log("请加载登录配置信息")
		return ;
	}
	var loginController = {};
	
	loginController.isLogined = function (){
		var token = loginController.getUserToken();
		return token?true:false;
	}
	
	loginController.getLoginUserInfo = function (){
		

		var loginInfo = window.sessionStorage[this.getContentPath()+"_token"];
		if(loginInfo){
			return eval("("+loginInfo+")");
		}
		return null;
	}
	loginController.setLoginUserInfo = function(token){
	

		window.sessionStorage[this.getContentPath()+"_token"] = token;
		store.commit('GETUSERINFO');
		
	}
	loginController.emptyLoginUserInfo = function(){
		
		delete window.sessionStorage._token;
	}
	/**
	 * 完整的登录流程，集成了单点登录。在未登录的情况之下，请调用此方法来进行登录。
	 * 在已经登录的情况之下，将不会做任何事，直接返回了。
	 * 
	 */
	loginController.loginFlow = function(){
		if(this.isLogined()){
			//已经登录了   不需要登录
			return ;
		}
		//在登录成功后，回调时会传入token
		var token = this.getRequestParamToken();
		if(token){
			//若有token，表示用户登录了，需要通过token去换取用户登录信息
			this.getLoginInfo(token);
		}else{
			//去执行登录
			this.toLogin();
		}
	}
	
	loginController.toLogin = function(){
		// 暂时取消判断登陆
		location.href=this.getLoginUrl();
	}
	loginController.toLoginOut = function(){

    location.href= loginConfig.sso_logout_url;
  }
	
	loginController.getLoginUrl = function (){
		return loginConfig.sso_login_url + "?service=" + loginConfig.email_local_service_url;
	}
	
	loginController.getRequestParamToken = function(){
		
		var para=window.location.search;//当前请求的url的参数部分
		return loginController.GetQueryString(para,"ticket");
	}
	
	
	//根据参数部分和参数名来获取参数值
	loginController.GetQueryString = function (paraPart,name) {
	    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	    var r = paraPart.substr(1).match(reg);
	    if (r != null) return unescape(r[2]); return null;
	}
	/**
	 * 获取用户级token
	 */
	loginController.getUserToken = function (){
		
		var loginUserInfo = this.getLoginUserInfo();
		return loginUserInfo && loginUserInfo.token;
	}
	/**
	 * 获取登录人的名字
	 */
	loginController.getUserName = function (){
		
		var loginUserInfo = this.getLoginUserInfo();
		return loginUserInfo && loginUserInfo.name;
	}
	/**
	 * 获取登录人的id
	 */
	loginController.getUserId = function (){
		
		var loginUserInfo = this.getLoginUserInfo();
		return loginUserInfo && loginUserInfo.userid;
	}
	/**
	 * 获取登录人的账号
	 */
	loginController.getUserAccount = function (){
		
		var loginUserInfo = this.getLoginUserInfo();
		return loginUserInfo && loginUserInfo.account;
	}
	
	loginController.getLoginInfo = function (token){
		
		$.ajax({
			
			url: loginConfig.sso_validate_url +"?ticket="+token+"&appKey="+loginConfig[this.getContentPath()+"_appKey"],
			type:"get",
			dataType:"json",
			async: false,
			success:function (r){


				if(r && r.logined){

					loginController.setLoginUserInfo(JSON.stringify(r));

				} else{
					loginController.toLogin();
				}
				
			}
		});
	}

	/**
	 * 获取当前项目的登录人信息（包含了token，用户名，用户id。）
	 * 因为系统内部包含了四个平台，而且每个平台的token都是不一样的，故登录人信息是和平台绑定的，
	 * 一个平台一个登录人信息，各自是隔离开的。
	 */
	loginController.getCurProjectLoginUserInfon = function (){
		
		
		var loginInfo = window.sessionStorage[this.getContentPath()+"_token"];
		if(loginInfo){
			return eval("("+loginInfo+")");
		}
		return null;
	}
	/**
	 * 获取contentPath。
	 * 列如：http://127.0.0.1:10086/gxqpt-security/#/interfacePermission
	 * contenPath： gxqpt-security
	 */
	loginController.getContentPath = function (){
		
		var contentPath = window.location.pathname;
		var endIndex = contentPath.indexOf("/",1);
		
		if(endIndex > 0){
			contentPath = contentPath.substring(1,endIndex);
		} else {
			contentPath = contentPath.substring(1);
		}
		return contentPath;
	}
	window.loginController = loginController;
	
	
	loginController.loginFlow();
};
