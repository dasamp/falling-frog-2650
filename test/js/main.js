/*
@author:=davidesampaio
*/
(function($) {
	var is_loading=0; //this variable its used to pervent the overload of service
	var timeout_info; //used by window.setTimeout
	
	//function for create each element of search result
	function createElementVideo(item){
		var image=item['preview']['medium'];
		//var link=item['_links']['self'];
		var link=item['channel']['name'];
		var display_name=item['channel']['display_name'];
		var viewers=item['viewers'];
		
		var html='<div class="video_item" data-url="'+link+'"><div class="image"><img src="'+image+'" class="animationcss"></div><div class="name animationcss">'+display_name+'<div class="viewers">'+viewers+' Viewers</div></div></div>';
		
		return html;
	}
	
	//for initialize the click on each element
	function initializeVideoOpen(){
		$('.video_item').click(function(e){
			if(is_loading==0){
				var url=$(this).attr("data-url");
				console.log(url);
				if(url){
					is_loading=1;
					
					var video="http://player.twitch.tv/?channel="+url;
					
					//open stream by url on iframe
					$("#video #frame_src").attr("src", video);
					$("#video").fadeIn(300);
					$("body").addClass('overHidden');
					updateInfoVideo(url);
				}
			}
		});	
				
		//for close the overlay video div
		$("#video .close").click(function(e){
			$("#video").fadeOut(300, function(){
				$("#video #frame_src").attr("src", '');
				$("#video .info_video").html('');
				$("body").removeClass('overHidden');
				is_loading=0;
				clearTimeout(timeout_info);
			});
		});
	}
	
	//for update the info of stream video
	function updateInfoVideo(channel){
		if(channel && is_loading==1){
			$.get('https://api.twitch.tv/kraken/streams/'+channel+'?client_id=jrfpskkh2avf3uyjwbmb4obdvkdkn3a', function(info){
				var stream=$(info['stream']);
				var html_info='<div class="info_item tit">'+stream[0]['channel']['status']+'</div><div class="info_item"><span>'+stream[0]['channel']['display_name']+'</span> playing <span>'+stream[0]['game']+'</span></div><div class="info_item"><strong>Viewers:</strong> '+stream[0]['viewers']+'</div><div class="info_item"><strong>Total Views:</strong> '+stream[0]['channel']['views']+'</div><div class="info_item"><strong>Followers:</strong> '+stream[0]['channel']['followers']+'</div>';
				
				//put the stream info on div element
				$("#video .info_video").html(html_info);
				
				//update the stream info (viewers, total views, etc) every 10 sec.
				timeout_info=window.setTimeout(function(){updateInfoVideo(channel)}, 10000);
				
			});
		}
	}
	
	//function to load videos by form submit and next/prev links
	function loadVideos(api_url){
		//verify if the service is free to use
		if(is_loading==0){
			is_loading=1; //change the service to "busy"
			$("#result").html('');
			$("#result").fadeOut(0);
			$("#loading").fadeIn(200);
			
			//get the API data
			$.get(api_url+'&client_id=jrfpskkh2avf3uyjwbmb4obdvkdkn3a', function(channel){
				if (channel["_total"]>0) {
					var streams=$(channel['streams']);
					$("#result").append('<div class="result_title">Results ('+channel["_total"]+')</div>');
					$.each(streams, function(i, item) {
						var video=createElementVideo(item);
						$("#result").append(video);
					});
					
					var links=channel['_links'];
					if(links['prev'] || links['next']){
						$("#result").append('<div class="next_link_outer"></div>');
					}
					if(links['prev']){
						$("#result .next_link_outer").append('<div id="prev_link" class="next_link animationcss">PREVIOUS PAGE</div>');
						$("#result #prev_link").click(function(e){
							loadVideos(links['prev']);
						});
					}
					if(links['next']){
						$("#result .next_link_outer").append('<div id="next_link" class="next_link animationcss">NEXT PAGE</div>');
						$("#result #next_link").click(function(e){
							loadVideos(links['next']);
						});
					}
				}else{
				   $("#result").append("<p>No results were found</p>");
				}
				
				is_loading=0; //change the service to "free"
				
				$("#loading").fadeOut(100, function(){
					$("#result").fadeIn(200, function(){
						initializeVideoOpen();	
					});
				});
			});
		}	
	}
	
	//on document ready init functions
	$(document).ready(function(){
		var btn=$("#submit", "#search_form");
		var form=$("#search_form");
		
		$(btn).click(function(e){$(form).submit();});
		
		$(form).on('submit', function(e){
			
			var text=$("#search", "#search_form").val();
			var api_url="https://api.twitch.tv/kraken/search/streams?q="+text;
		
			if(text!=''){
				loadVideos(api_url);
			}else{
				$("#result").append("<p>You must fill a text to search</p>");	
			}
		});
		
	});
})(jQuery);