var style_cookie_name = "style";
var style_cookie_duration = 30;
var current_style = "bright";

function switchLight() {
	if (current_style == "bright")
		switch_style("dark");
	else
		switch_style("bright");
}

function switch_style(css_title) {
	current_style = css_title;
	var i, link_tag;
	for (i = 0, link_tag = document.getElementsByTagName("link"); i < link_tag.length; i++) {
		if ((link_tag[i].rel.indexOf("stylesheet") != -1) && link_tag[i].title) {
			link_tag[i].disabled = true;
			if (link_tag[i].title == css_title) {
				link_tag[i].disabled = false;
			}
		}
		$.cookie(style_cookie_name, css_title, {
			expires : style_cookie_duration
		});
	}
}
function set_style_from_cookie() {
	var css_title = $.cookie(style_cookie_name);
	if ( typeof css_title === 'undefined' ) {
		switch_style(css_title);
	}
}

