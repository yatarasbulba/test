(function(win, doc, $) {
	var isEventSupported = (function(){
		var TAGNAMES = {
			'select':'input','change':'input',
			'submit':'form','reset':'form',
			'error':'img','load':'img','abort':'img'
			};
		function isEventSupported(eventName) {
			var el = doc.createElement(TAGNAMES[eventName] || 'div');
			eventName = 'on' + eventName;
			var isSupported = (eventName in el);
			if (!isSupported) {
				el.setAttribute(eventName, 'return;');
				isSupported = typeof el[eventName] === 'function';
			}
			el = null;
			return isSupported;
		}
		return isEventSupported;
	})(),
		clickTrigger,
		mobile;

	if (isEventSupported('touchstart')) {
		clickTrigger = 'touchstart';
		mobile = true;
	} else {
		clickTrigger = 'click';
		mobile = false;
	}

	/*function setCookie(name, value, days) {
		var expires;
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = '; expires=' + date.toUTCString();
		}
		else expires = '';
		doc.cookie = name + '=' + value + expires + '; path=/';
	}

	function readCookie(name) {
		var nameEQ = name + '=',
			ca = doc.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
		return null;
	}

	function removeCookie(name) {
		setCookie(name, '', -1);
	}*/

	//var ie = !!(doc.all || (!!win.MSInputMethodContext && !!doc.documentMode));

	function lazyScroll(lsSelector, lsTime, lsOffset) {
		if (lsSelector[0]) {
			let winHeight = Math.max(doc.documentElement.clientHeight, win.innerHeight || 0),
				selectorOffset = lsSelector.offset().top;
			lsOffset = lsOffset || 0;
			lsTime = lsTime || 500 * Math.sqrt(selectorOffset/winHeight);
			$('html,body').animate({
				scrollTop: selectorOffset + lsOffset
			}, lsTime);
		}
	}

	function loadScript(url, callback) {
		$.ajax({
			type: 'GET',
			url: url,
			success: callback,
			dataType: 'script',
			cache: true
		})
	}

	$(function() {
		let pageBody = $('body'),
			pageWidthFactor = function() {
				let widthFactor = 1,
					winWidth = Math.max(doc.documentElement.clientWidth, win.innerWidth || 0);
				if (winWidth > 2200) {
					widthFactor = 1.25;
				} else if (winWidth > 3500) {
					widthFactor = 1.75
				}
				return widthFactor;
			};


		if (mobile) {
			pageBody.addClass('mobile');
		}


		let ymapTarget = $('#ymap');
		if (ymapTarget[0]) {
			loadScript('https://api-maps.yandex.ru/2.1/?lang=ru_RU', function () {
				ymaps.ready(function () {
					let placemarkIcon = '/images/ymap_mark.svg',
						placemarkIconSize = [52 * pageWidthFactor(), 73 * pageWidthFactor()],
						objMap = new ymaps.Map(ymapTarget[0], {
							center: ymapTarget.data('coords').split(','),
							zoom: 16,
							controls: []
						}),
						mapObject = new ymaps.Placemark(ymapTarget.data('coords').split(','), {
							balloonContent: ''
						},
						{
							openBalloonOnClick: false,
							cursor: 'default',
							iconLayout: 'default#image',
							iconImageHref: placemarkIcon,
							iconImageSize: placemarkIconSize,
							iconImageOffset: [0 - placemarkIconSize[0] / 2, 0 - placemarkIconSize[1]]
						});

					// ymapTarget.addClass('ready');

					objMap.geoObjects.add(mapObject);
					objMap.controls.add('zoomControl', {
						float: 'none',
						size: 'small',
						position: {bottom: 32, right: 20}
					});
					objMap.controls.add('fullscreenControl', {
						float: 'none',
						position: {top: 20, right: 20}
					});
					if (mobile) {
						objMap.behaviors.disable('drag');
					} else {
						objMap.behaviors.disable('scrollZoom');
					}
				})
			})
		}


		$('#menu_btn').on(clickTrigger, function(){
			pageBody.toggleClass('menu');
		});


		$('#menu').find('a').on(clickTrigger, function(){
			pageBody.removeClass('menu');
		});


		pageBody.find('a').filter('[href^="#"]').on(clickTrigger, function(){
			lazyScroll($($(this).attr('href')), 500);
			return false;
		});


		$('#programs').waypoint(function () {
			$('#programs').addClass('act');
		}, {
			offset: 'bottom-in-view'
		});


		pageBody.find('div.main_type2').waypoint(function () {
			$('#img_large1').addClass('act');
		}, {
			offset: Math.max(doc.documentElement.clientHeight, win.innerHeight || 0) / 2
		});


		let scrollTopBtn = $('#gotop');
		pageBody.waypoint(function () {
			scrollTopBtn.toggleClass('act')
		}, {
			offset: '-100px'
		});


		scrollTopBtn.on(clickTrigger, function(){
			lazyScroll(pageBody, 500)
		});


		let headerScene = $('#header_scene')[0];
		let headerParallax = new Parallax(headerScene, {
			relativeInput: true,
			limitY: 0,
			frictionX: 0.08
		});


		if (!mobile) {
			let sideScene = pageBody.find('div.side_scene');
			sideScene.each(function(){
				let curScene = $(this)[0],
					curInputElement = $(this).parents('div.block');
				let sideParallax = new Parallax(curScene, {
					relativeInput: true,
					inputElement: curInputElement[0],
					hoverOnly: true,
					frictionX: 0.055
				});
			});
		}


		pageBody.find('div.toggle_container').each(function(){
			let toggleBlock = $(this),
				togglInner = toggleBlock.children().eq(0),
				toggleBtn = toggleBlock.find('button.toggle_btn'),
				toggleHeight;

			if (togglInner.outerHeight() < 420) {
				toggleBlock.addClass('act');
				toggleBtn.remove();
			} else {
				toggleBtn.on(clickTrigger, function(){
					toggleBlock.toggleClass('act');
					toggleHeight = toggleBlock.hasClass('act') ? togglInner.outerHeight() + toggleBtn.height() : 420;
					toggleBlock.animate({
						height: toggleHeight
					}, 350, function(){
						if (toggleHeight > 420) toggleBlock.css('height', 'auto')
					})
				})
			}
		});


		let pageForm = pageBody.find('div.form').children('form'),
			mandatoryError = function (obj) {
				let objInput = obj.find('.mandatory').not('li'),
					objError = false,
					oil = objInput.length,
					objInputCur;
				while (oil--) {
					objInputCur = objInput.eq(oil);
					if /*(objInputCur.prop('tagName') === 'SELECT' && objInputCur.val() === '0') {
						objInputCur.parent().addClass('error');
						objError = true;
					} else if*/ (objInputCur.attr('name') === 'phone' && !objInputCur.inputmask('isComplete')) {
						objInputCur.addClass('error');
						objError = true;
					} else if (!/[\wа-яА-Я]/.test(objInputCur.val())) {
						objInputCur.val('').addClass('error');
						objError = true;
					}
				}
				return objError;
			};

		if ($.fn.inputmask) {
			pageForm.find('input.phone_masked').inputmask('+7 (999) 999-9999', {
				clearMaskOnLostFocus: true,
				clearIncomplete: true
			})
		}

		pageForm.each(function(){
			let curForm = $(this);
			curForm.on('submit', function () {
				if (!mandatoryError(curForm)) {
					let formData = new FormData(this);
					$.ajax({
						data: formData,
						type: 'post',
						url: curForm.data('handler'),
						success: function () {
							pageBody.removeClass('show_form').addClass('show_result form_success');
							ing_events({category:"forms",action:"submit",label:"application",ya_label:"application"});
						},
						error: function () {
							pageBody.removeClass('show_form').addClass('show_result form_error')
						},
						cache: false,
						contentType: false,
						processData: false
					});
				}
				return false;
			});
		});

		pageBody.on('focus','.error',function(){
			$(this).removeClass('error');
		});


		pageBody.find('button.popup_toggle').on(clickTrigger, function() {
			pageForm.find('input.error').removeClass('error');
			pageBody.addClass('show_form');
		}).end().find('div.popup_form').on(clickTrigger, function(){
			if (!mobile) {
				pageForm.find('input.error').removeClass('error');
				pageBody.removeClass('show_form show_result')
			}
		}).children().on(clickTrigger, function(e){
			e.stopPropagation()
		}).find('div.popup_form_close, input[type=button]').on(clickTrigger, function(){
			pageForm.find('input.error').removeClass('error');
			pageBody.removeClass('show_form show_result');
		});


		let quizContainer = $('#quiz_container'),
			quizSlider = quizContainer.find('div.quiz_slider');
		if (quizSlider[0]) {
			let quizForm = quizContainer.children('form'),
				quizResult = quizContainer.find('div.quiz_result'),
				quizValue = $();
			quizSlider.each(function() {
				let curQuizSlider = $(this),
					valueTarget = curQuizSlider.prev(),
					valueMin = parseInt(valueTarget.data('min')),
					valueMax = parseInt(valueTarget.data('max')),
					valueIncrement = (valueTarget.data('step')) ? valueTarget.data('step') : 1;
				curQuizSlider.slider({
					range: 'min',
					step: valueIncrement,
					value: valueMin,
					min: valueMin,
					max: valueMax,
					slide: function (event, ui) {
						valueTarget.val(ui.value).removeClass('error');
					}
				});
				/*valueTarget.on('change, keyup', function() {
					if (valueTarget.val() >= valueMin && valueTarget.val() <= valueMax) {
						curQuizSlider.slider('value', valueTarget.val())
					} else {
						valueTarget.val(valueTarget.val().slice(0, -1));
					}
				});*/
				/*let b = '';
				if ($.fn.inputmask) {
					Inputmask({
						mask: '[*]{1,3}',
						definitions: {
							'*': {
								validator: function (chrs, buffer, pos, strict, opts) {
									let valExp = new RegExp('[0-9]');
									/!*if (pos > 0) {
										b = b + buffer.buffer[pos-1] + chrs
									}
									noExceed = (b <= valueMax);*!/
									console.log('chrs:' + chrs + ', buffer:' + (buffer[pos - 1] + chrs) + ', pos:' + pos);

									let ml = Object.keys(buffer).length;
									while (ml--) {
										console.log(Object.keys(buffer)[ml])
									}

									return (valExp.test(buffer[pos - 1] + chrs) /!*&& parseInt(buffer[pos - 1] + chrs) <= valueMax*!/);
								}
							}
						},

						placeholder: '',
						clearMaskOnLostFocus: false,
						clearIncomplete: false,
						showMaskOnHover: false,
						showMaskOnFocus: true
					}).mask(valueTarget)
				}*/
				if ($.fn.inputmask) {
					Inputmask('decimal',{
						min: valueMin,
						max: valueMax,
						placeholder: '',
						oncomplete: function(){
							curQuizSlider.slider('value', valueTarget.val())
						},
						clearMaskOnLostFocus: false,
						clearIncomplete: false,
						showMaskOnHover: false,
						showMaskOnFocus: true
					}).mask(valueTarget)
				}
				quizValue = quizValue.add(valueTarget);
			});
			quizContainer.children('button').eq(0).on(clickTrigger, function(){
				let quizInputError = false,
					qvl = quizValue.length;
				while (qvl--) {
					if (!(quizValue.eq(qvl).val() >= quizValue.eq(qvl).data('min') && quizValue.eq(qvl).val() <= quizValue.eq(qvl).data('max'))) {
						quizInputError = true;
						quizValue.eq(qvl).addClass('error').val('');
					}
				}
				if (!quizInputError) {
					quizForm.submit();
				}
			});
			quizForm.on('submit', function(){
				quizContainer.addClass('act');
				let formData = new FormData(this);
				$.ajax({
					data: formData,
					type: 'post',
					url: 'quiz.php',
					success: function (response) {
						let formResult = $.parseJSON(response),
							formResultClass = formResult.class.split(','),
							formResultValue = formResult.value.split(','),
							frl = formResultClass.length;
						$('#quiz_total').html(formResult.answer);
						while (frl--) {
							quizResult.eq(frl).addClass(formResultClass[frl]).children('div').text(formResultValue[frl])
						}
						setTimeout(function(){
							quizContainer.addClass('res');
						},400);
						setTimeout(function(){
							quizContainer.removeClass('act');
						},500);
					},
					cache: false,
					contentType: false,
					processData: false
				});
				return false;
			})
		}
	});

}(window, document, jQuery));