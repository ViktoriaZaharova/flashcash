var timerInterval;

$(document).ready(() => {
	$('.phone-input').inputmask({'mask': '+38(099) 99-99-999'});
	if (typeof creditDatas !== 'undefined') {
		calculateCredit(getSumm(), getDaysCount());
	}
	$(document).delegate('.input-effect input, .input-effect textarea', 'focusout', function () {
		if ($(this).val() != '') {
			$(this).addClass('has-content');
			$(this).closest('.form-group').removeClass('error');
		} else {
			$(this).removeClass('has-content');
		}
	});

	$(document).delegate('#get-geo input', 'change', function (e) {
		e.preventDefault();
		e.stopPropagation();

		let checkbox = $(this),
			isChecked = $('#get-geo input').is(':checked'),
			formGroup = $(this).closest('.form-group');

		checkbox.prop('checked', isChecked ? false : true);

		formGroup.find('.error-text').text('');
		formGroup.removeClass('error');
		if (isChecked) {
			if (navigator.geolocation) {
				checkbox.prop('checked', true);
				navigator.geolocation.getCurrentPosition(position => {
					// Get the coordinates of the current possition.
					let lat = position.coords.latitude,
						lng = position.coords.longitude;

					$('#latitude').val(lat);
					$('#longitude').val(lng);
					checkbox.prop('checked', true);
				}, error => {
					let errorText = 'Не удалось получить местоположение';
					if (error.code === 1) {
						errorText = 'Вы отключили возможность получения местоположения';
					}
					formGroup.find('.error-text').text(errorText);
					formGroup.addClass('error');
					checkbox.prop('checked', false);
				});
			} else {
				formGroup.find('.error-text').text('Ваш браузер не поддерживает Geolocation API');
				formGroup.addClass('error');
				checkbox.prop('checked', false);
			}
		} else {
			checkbox.prop('checked', false);
		}
	});

	$(document).delegate('.form-group select', 'change', e => {
		let _this = $(e.currentTarget);
		if (_this.val()) {
			_this.closest('.form-group').removeClass('error');
		}
	});

	$('#about-us').click(function (e) {
		e.preventDefault();
		$('#about-us-menu').toggleClass('visible');
		$(this).toggleClass('active');
	});

	$(document).delegate('body', 'click', function (event) {
		if (!$(event.target).closest('#about-us-menu, #about-us').length) {
			$('#about-us').removeClass('active');
			$('#about-us-menu').removeClass('visible');
		}

		if (!$(event.target).closest('.lang-switcher-container').length)
			$('.lang-switcher-container ul').removeClass('open');

		if (!$(event.target).closest('.cabinet-container').length)
			$('.cabinet-container').removeClass('open');
	});

	$('#calculate-carousel').owlCarousel({
		margin: 10,
		loop: true,
		autoWidth: false,
		items: 1,
		dots: true,
		autoplay: true,
		autoplayTimeout: 3000,
		responsive: {
			0: {
				autoHeight: true
			},
			769: {
				autoHeight: false
			}
		}
	});

	let menuOwl = $('#menu-carousel').owlCarousel({
		margin: 20,
		loop: true,
		autoWidth: false,
		dots: false,
		nav: true,
		navText: ["<i class='icon-fc-angle-down'></i>", "<i class='icon-fc-angle-down'></i>"],
		callbacks: true,
		autoplay: true,
		autoplayTimeout: 3000,
		autoplayHoverPause: true,
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			768: {
				items: 3
			},
			1070: {
				items: 4
			}
		}
	});

	menuOwl.on('refresh.owl.carousel', function (event) {
		$('#menu-carousel').addClass('show');
	});

	$('#reviews').carousel({
		dist: -190
	});

	$('.carousel-arrow').click(function () {
		if ($(this).hasClass('carousel-next')) {
			$('#reviews').carousel('next');
		} else {
			$('#reviews').carousel('prev');
		}
	});

	$('.lang-switcher-container > a').click(function (e) {
		e.preventDefault();
		$(this).closest('.lang-switcher-container').find('ul').toggleClass('open');
	});

	$('.credit-calculate .summ-slider:not(.day-slider) .value input').keypress(function (e) {
		if ((e.keyCode < 48 || e.keyCode > 57)) {
			e.preventDefault();
			return false;
		}
	}).focus(function (e) {
		let value = $(this).val().replace(/\s+/g, '');
		$(this).val(value);
		setInputWidth($(this));
	}).change(function (e) {
		let value = $(this).val();
		if (+value > 10000) {
			$(this).val('10 000');
		}
		if (+value < 1000) {
			$(this).val('1 000');
		}
		$('#range-credit-summ').val(value).change();
		setInputWidth($(this));
	}).focusout(function () {
		let value = $(this).val();
		$(this).val(moneyFormat(value));
		setInputWidth($(this));
	});

	$('.credit-calculate .day-slider .value input').keypress(function (e) {
		if ((e.keyCode < 48 || e.keyCode > 57)) {
			e.preventDefault();
			return false;
		}
	}).focus(function (e) {
		setInputWidth($(this));
	}).change(function (e) {
		let value = $(this).val();
		$('#range-credit-days').val(value).change();
		setInputWidth($(this));
	}).focusout(function () {
		setInputWidth($(this));
	});

	$('.credit-calculate .summ-slider .value input').on('input', function () {
		setInputWidth($(this));
	});

	$(document).delegate('.form-group__checkbox.error input', 'change', e => {
		let _this = $(e.currentTarget);
		_this.closest('.form-group__checkbox').removeClass('error');
	});

	$(document).delegate('.form-group.error .control--radio input', 'change', e => {
		let _this = $(e.currentTarget);
		_this.closest('.form-group').removeClass('error');
	});

	// Init calendar
	if ($('.calculate-section').data('type') === 'with-sliders') {
		let date = new Date();
		date.setDate(date.getDate() + 14);
		$('.calendar-checked-date span').text(weekDayNames[date.getDay()] + ', ' + date.getDate() + ' ' + monthNamesSclon[date.getMonth()]);
	} else {
		initCalendar();
	}

	function initCalendar() {
		let today = new Date();

		let year = today.getFullYear(),
			month = today.getMonth(),
			date = today.getDate();

		let changeMonth = false;

		let calendarHTML = '';
		// Weeks
		calendarHTML += '<div class="calendar-row">';
		for (let i = 1; i <= 7; i++) {
			let day = new Date(year, month, date + (i - 1)),
				weekDay = day.getDay();
			calendarHTML += '<div class="calendar-item week-day">' + weekDayNames[weekDay] + '</div>';
		}
		calendarHTML += '</div>';
		// Dates
		let itemCount = 1;
		for (let i = 1; i <= 35; i++) {
			let day = new Date(year, month, date + (i - 1)),
				classes = '';
			if (i === 1) {
				calendarHTML += '<div class="calendar-row">';
				classes += 'inactive ';
			}

			if (i > 30) {
				classes += 'inactive ';
			}

			if (i === 14) {
				classes += 'checked ';
			}

			if (month !== day.getMonth() && !changeMonth) {
				changeMonth = true;
				if (itemCount !== 1) {
					for (let a = 1; a <= 8 - itemCount; a++) {
						calendarHTML += '<div class="calendar-item inactive"></div>';
					}
					calendarHTML += '</div>';
					calendarHTML += '<div class="month-name">' + monthNames[day.getMonth()] + '</div>';
					calendarHTML += '<div class="calendar-row">';
					for (let a = 1; a <= (itemCount - 1); a++) {
						calendarHTML += '<div class="calendar-item inactive"></div>';
					}
				} else {
					calendarHTML += '</div><div class="month-name">' + monthNames[day.getMonth()] + '</div><div class="calendar-row">';
				}
			}

			calendarHTML += '<div class="calendar-item ' + classes + '" data-date="' + day + '">' + day.getDate() + '</div>';
			if ((i % 7 === 0 && i !== 0) || i === 35) {
				calendarHTML += '</div>';
				if (i !== 35) {
					calendarHTML += '<div class="calendar-row">';
				}
			}

			if (itemCount === 7) {
				itemCount = 1;
			} else {
				itemCount++;
			}
		}
		$('#calendar').append(calendarHTML);
		let checkedDate = new Date($('#calendar .calendar-item.checked').data('date'));
		$('.calendar-checked-date span').text(weekDayNames[checkedDate.getDay()] + ', ' + checkedDate.getDate() + ' ' + monthNamesSclon[checkedDate.getMonth()]);
	}

	$(document).delegate('#calendar .calendar-item:not(.inactive):not(.checked):not(.week-day)', 'click', function () {
		let checkedDate = new Date($(this).data('date')),
			currentDay = new Date();
		$('#calendar .calendar-item').removeClass('checked');
		$(this).addClass('checked');
		let daysCount = Math.ceil(Math.abs(checkedDate.getTime() - currentDay.getTime()) / (1000 * 3600 * 24));
		$('#range-credit-days').val(daysCount);
		$('.calendar-checked-date span').text(weekDayNames[checkedDate.getDay()] + ', ' + checkedDate.getDate() + ' ' + monthNamesSclon[checkedDate.getMonth()]);
		calculateCredit(getSumm(), daysCount);
	});

	$(document).delegate('.remove-document', 'click', e => {
		let _this = $(e.currentTarget),
			parent = _this.closest('.document-upload-step__item');
		parent.remove();
	});

	$(document).delegate('#add-document-upload-step__item', 'click', e => {
		let _this = $(e.currentTarget),
			itemsCount = $('#document-upload .document-upload-step__item').length,
			newInputId = itemsCount + 1;

		let uploadItemHtml = $('.document-upload-step__item.display-none').clone();
		$(uploadItemHtml).removeClass('display-none');
		$(uploadItemHtml).find('.input-file label').attr('for', `type-file-${newInputId}`);
		$(uploadItemHtml).find('.input-file input').attr('id', `type-file-${newInputId}`);
		_this.parent().before(uploadItemHtml);
	});

	// Scroll func => header
	$(window).scroll(function () {
		const $this = $(this),
			$head = $('header.header');

		if ($this.scrollTop() > 10) {
			$head.addClass('scrolled');
		} else {
			$head.removeClass('scrolled');
		}
	});

	$('.cabinet-container .cabinet').click(function (e) {
		e.preventDefault();
		$(this).parent().toggleClass('open');
	});

	$('#burger').click(function () {
		if ($('.burger-ico').hasClass('active')) {
			$('.burger-ico').toggleClass('active');
			$('.main-menu-col').slideUp(200);
		} else {
			$('.burger-ico').toggleClass('active');
			$('.main-menu-col').slideDown(200);
		}
	});

	$('.about-close').click(function () {
		$(this).parent().removeClass('visible');
	});

	$('.question-answer-item .description').click(function () {
		const parent = $(this).closest('.question-answer-item'),
			content = parent.find('.answer-content');
		if (parent.hasClass('opened')) {
			content.slideUp(200);
			parent.removeClass('opened');
		} else {
			content.slideDown(200);
			parent.addClass('opened');
		}
	});

	$('.anchor').click(e => {
		e.preventDefault();
		const target = $(e.currentTarget).attr('href');
		const destination = $(target).offset().top - $('header').height() - 10;
		$('html, body').animate({
			scrollTop: destination
		}, {
			duration: 500,
			easing: "swing"
		});
	});

	$(document).delegate('#registration-address-checkbox', 'change', function () {
		if (this.checked) {
			$('#registration-address').slideUp(300);
		} else {
			$('#registration-address').slideDown(300);
		}
	});

	var stepsFormConfig;
	let formSubmited = false;

	if ($('.credit-registration-container').data('type') === 'with-one-step') {
		stepsFormConfig = {
			headerTag: 'h3',
			bodyTag: 'section',
			autoFocus: true,
			stepsOrientation: 'horizontal',
			transitionEffect: 'fade',
			transitionEffectSpeed: 250,
			titleTemplate: '<span class="number">#index#</span>',
			onInit: function (event, current) {
				$('.actions > ul > li > a[href="#previous"]').remove();
			},
			onStepChanging: () => {
				if (!formSubmited) {
					$('#first-step').submit();
					formSubmited = true;
				}
			},
			labels: {
				next: creditFormButtons.next
			}
		};
	} else if ($('.credit-registration-container').data('type') === 'with-last-step') {
		stepsFormConfig = {
			headerTag: 'h3',
			bodyTag: 'section',
			autoFocus: true,
			stepsOrientation: 'horizontal',
			transitionEffect: 'fade',
			transitionEffectSpeed: 250,
			titleTemplate: '<span class="number">#index#</span>',
			startIndex: 5,
			labels: {
				save: creditFormButtons.save,
				next: creditFormButtons.next,
				previous: creditFormButtons.previous,
				finish: creditFormButtons.finish
			},
			onInit: () => {
				$('.actions > ul > li > a[href="#previous"], .actions > ul > li > a[href="#next"]').parent().remove();
				$('.steps > ul > li').addClass('disabled');
				$('.steps > ul > li').attr('aria-disabled', 'true');
			},
			onStepChanging: () => {
				return false;
			},
			onFinished: () => {
				if (!formSubmited) {
					$('#document-upload').submit();
					formSubmited = true;
				}
			}
		};
	} else {
		stepsFormConfig = {
			headerTag: 'h3',
			bodyTag: 'section',
			autoFocus: true,
			stepsOrientation: 'horizontal',
			transitionEffect: 'fade',
			transitionEffectSpeed: 250,
			titleTemplate: '<span class="number">#index#</span>',
			startIndex: 1,
			labels: {
				save: creditFormButtons.save,
				next: creditFormButtons.next,
				previous: creditFormButtons.previous,
				finish: creditFormButtons.finish
			},
			onInit: function (event, current) {
				$('.actions > ul > li > a[href="#previous"]').css('display', 'none');
				$('#steps-uid-0-t-0').parent().addClass('disabled');
				$('#steps-uid-0-t-0').parent().attr('aria-disabled', 'true');
			},
			onStepChanging: function (event, currentIndex, newIndex) {
				if (newIndex === 1) {
					$('.actions > ul > li > a[href="#previous"]').css('display', 'none');
				} else {
					$('.actions > ul > li > a[href="#previous"]').css('display', 'block');
				}
				if (newIndex === 0) {
					return false;
				} else {
					return true;
				}
			},
			onFinished: () => {
				if (!formSubmited) {
					$('#credit-steps-form').submit();
					formSubmited = true;
				}
			}
		};
	}

	$('.credit-steps-form').steps(stepsFormConfig);

	$(document).delegate('.social-links .add-link', 'click', function () {
		$(this).before('<div class="social-links-item form-group input-effect">' +
			'<input type="text" placeholder="Введите ссылку">' +
			'<div class="remove">×</div>' +
			'</div>');
	});


	$(document).delegate('.social-links .remove', 'click', function () {
		$(this).parent().remove();
	});

	$('#edit-data').click(function () {
		$('.main-personal-page .form-group input').attr('disabled', false);
	});

	$('.credit-container__item').click(function () {
		if ($(this).hasClass('opened')) {
			$(this).find('.credit-container__item--content').slideUp(200);
			$(this).removeClass('opened');
		} else {
			$(this).find('.credit-container__item--content').slideDown(200);
			$(this).addClass('opened');
		}
	});

	const approvedUsers = [{
			user: 'Сергей Анатолиевич',
			text: 'Вам одобрили кредит<span>25 000</span>грн'
		},
		{
			user: 'Петр Пупкович',
			text: 'Получил<span>5</span>грн на карту'
		},
		{
			user: 'Алексей Петрович',
			text: 'Передаёт всем привет'
		}
	];

	let hideBubbleTimeOut, currentUser = 0;
	// setInterval(() => {
	// 	clearTimeout(hideBubbleTimeOut);
	// 	$('#approved-bubble').find('.name').text(approvedUsers[currentUser].user);
	// 	$('#approved-bubble').find('.text').html(approvedUsers[currentUser].text);
	// 	$('#approved-bubble').addClass('show');
	// 	hideBubbleTimeOut = setTimeout(() => {
	// 		$('#approved-bubble').removeClass('show');
	// 		if ((currentUser + 1) === approvedUsers.length) {
	// 			currentUser = 0;
	// 		} else {
	// 			currentUser++;
	// 		}
	// 	}, 5000);
	// }, 30000);

	$('#sw-success').click(() => {
		Swal.fire({
			title: false,
			type: '',
			html: '<div class="status-popup">' +
				'<div class="icon">' +
				'<img src="./static/images/png/card-success.png">' +
				'</div>' +
				'<h3>Поздравляем!</h3>' +
				'<p>Ваш кредит одобрен.</p>' +
				'</div>',
			showCloseButton: false,
			showCancelButton: false,
			focusConfirm: true,
			confirmButtonText: '<a class="btn-main btn-orange" href="/">На главную</a>',
		});
	});

	$('#sw-error').click(() => {
		Swal.fire({
			title: false,
			type: '',
			html: '<div class="status-popup">' +
				'<div class="icon">' +
				'<img src="./static/images/png/card-error.png">' +
				'</div>' +
				'<h3>Сожалеем!</h3>' +
				'<p>Ваш кредит не одобрен.<br>Приходите через 30 дней.</p>' +
				'</div>',
			showCloseButton: false,
			showCancelButton: false,
			focusConfirm: true,
			confirmButtonText: '<a class="btn-main btn-orange" href="/">На главную</a>',
		});
	});

	$('#sw-news').click(function () {
		Swal.fire({
			title: false,
			type: '',
			html: '<div class="status-popup">' +
				'<div class="icon">' +
				'<i class="fas fa-envelope"></i>' +
				'</div>' +
				'<h3>Поздравляем!</h3>' +
				'<p>Теперь ты в клубе FlashCash и будешь получать информацию об акциях и промо!</p>' +
				'</div>',
			showCloseButton: false,
			showCancelButton: false,
			focusConfirm: true,
			confirmButtonText: '<button type="button" class="btn-main btn-orange">Закрыть</button>',
		});
	});

	$('#sw-documents').click(function () {
		Swal.fire({
			title: false,
			type: '',
			html: '<div class="status-popup">' +
				'<div class="icon">' +
				'<i class="fas fa-file-alt"></i>' +
				'</div>' +
				'<h3>Поздравляем!</h3>' +
				'<ul class="custom-ul mb-2em">' +
				'<li><div>Кредитные средства будут зачислены на карту, указанную в договоре</div></li>' +
				'<li><div>Подписанные вами документы доступные в личном кабинете по данной <a href="/client/personal_data/">ссылке</a>. Введите ваш email для получения копий документов и ведения официальной переписки.</div></li>' +
				'</ul>' +
				'<form id="popup-email">' +
				'<div class="form-group input-effect">' +
				'<input type="email" name="email" required="required">' +
				'<label>Введите ваш email</label>' +
				'<span class="error-text">Заполните поле</span>' +
				'</div>' +
				'</form>' +
				'</div>',
			showCloseButton: false,
			showCancelButton: false,
			focusConfirm: true,
			confirmButtonText: '<button type="button" class="btn-main btn-orange">Ознакомлен</button>',
			preConfirm: () => {
				if ($('#popup-email input').val() === '') {
					$('#popup-email .form-group').addClass('error');
					return false;
				}
			}
		}).then((result) => {
			if (result.value) {
				$('#popup-email').submit();
			}
		});
	});

	$('#change-photo').click(function () {
		$(this).parent().find('[type=file]').click();
	});

	$('[name="document_type"]').change(function () {
		let value = $(this).val(),
			parent = $(this).closest('.column');

		parent.find('[data-type]').addClass('display-none');
		parent.find('[data-type="' + value + '"]').removeClass('display-none');
	});

	$("#ticket_form").submit(function (e) {
		e.preventDefault();

		let form = $(this),
			url = form.attr('action');

		$.ajax({
			type: "POST",
			url: url,
			data: form.serialize(),
			success: function (data) {
				let _type = 'error';
				if (data.result === "ok") {
					form[0].reset();
					_type = 'success';
				}
				Swal.fire({
					type: _type,
					text: data.msg,
					confirmButtonText: '<button class="btn-main btn-orange">ОК</button>',
				})
			}
		});
	});

	var tabAnimation = false;
	$('.tab-elems a').click(e => {
		e.preventDefault();
	});

	$(document).delegate('.tab-elems a:not(.active)', 'click', e => {
		var _this = $(e.currentTarget);
		if (!tabAnimation) {
			tabAnimation = true;
			var targetID = _this.attr('href');
			var target = _this.closest('.product-tabs__container').find(targetID);
			var currentBlock = _this.closest('.product-tabs__container').find($('.tab-elems a.active').attr('href'));
			$('.tab-elems a').removeClass('active');
			_this.addClass('active');
			currentBlock.slideUp(350, () => {
				target.slideDown(350, () => {
					tabAnimation = false;
				});
			});
		}
	});

	$(document).delegate('.tab-link', 'click', e => {
		e.preventDefault();
	});

	$(document).delegate('.tab-link:not(.active)', 'click', e => {
		const _this = $(e.currentTarget),
			targetId = _this.attr('href');
		$('.tab-link').removeClass('active');
		$('.about-us-menu__inner .tab-content').hide();
		_this.addClass('active');
		$(targetId).show();
	});

	$(document).delegate('.accordion-link', 'click', e => {
		const _this = $(e.currentTarget),
			targetId = _this.attr('href');

		if (_this.hasClass('active')) {
			_this.removeClass('active');
			$(targetId).slideUp(250);
		} else {
			_this.addClass('active');
			$(targetId).slideDown(250);
		}
	});
	initDateRangePicker();

	$(document).delegate('[href="#reload"]', 'click', e => {
		e.preventDefault();
		location.reload();
	});

	function initDateRangePicker() {
		let currentDate = new Date(),
			tomorrow = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1),
			lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 30),
			daysCountInput = $('#days-count'),
			dayCount = +daysCountInput.val(),
			setDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + dayCount),
			setDateFormated = `${setDate.getDate()}.${setDate.getMonth() + 1}.${setDate.getFullYear()}`;

		$('#form-daterange').daterangepicker({
			'locale': {
				format: 'DD.M.YYYY',
				separator: ' - ',
				applyLabel: 'Применить',
				cancelLabel: 'Отмена',
				fromLabel: 'От',
				toLabel: 'До',
				customRangeLabel: 'Свой',
				daysOfWeek: [
					'Вс',
					'Пн',
					'Вт',
					'Ср',
					'Чт',
					'Пт',
					'Сб'
				],
				monthNames: [
					'Январь',
					'Февраль',
					'Март',
					'Апрель',
					'Май',
					'Июнь',
					'Июль',
					'Август',
					'Сентябрь',
					'Октябрь',
					'Ноябрь',
					'Декабрь'
				],
				firstDay: 1
			},
			singleDatePicker: true,
			autoApply: true,
			minDate: `${tomorrow.getDate()}.${tomorrow.getMonth() + 1}.${tomorrow.getFullYear()}`,
			maxDate: `${lastDate.getDate()}.${lastDate.getMonth() + 1}.${lastDate.getFullYear()}`,
			opens: 'center',
			startDate: setDateFormated,
			endDate: setDateFormated
		}, start => {
			$('#form-daterange').find('input').val(start.format('DD.MM.YYYY'));
			let momentCurrent = moment(currentDate),
				selectedDaysCount = start.diff(momentCurrent, 'days');
			daysCountInput.val(selectedDaysCount + 1);
		}).init(() => {
			$('#form-daterange').find('input').val(setDateFormated);
		});

		$(document).delegate('#days-count', 'input', e => {
			let _this = $(e.currentTarget);
			_this.val(_this.val().replace(/\D/, ''));
		});

		$(document).delegate('#days-count', 'change', e => {
			let _this = $(e.currentTarget),
				val = +_this.val();
			if (val > 30) {
				_this.val(30);
				val = 30;
			} else if (val <= 0) {
				_this.val(1);
				val = 1;
			}
			let currentDate = new Date(),
				lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + val),
				setDate = `${lastDate.getDate()}.${lastDate.getMonth() + 1}.${lastDate.getFullYear()}`;
			$('#form-daterange').data('daterangepicker').setStartDate(setDate);
			$('#form-daterange').data('daterangepicker').setEndDate(setDate);
			$('#form-daterange').find('input').val(setDate);
		});
	}
});

$(window).on('load', () => {
	$('.input-effect').each(function (i, item) {
		if ($(item).find('input').val() !== '') {
			$(item).find('input').addClass('has-content');
		}
	});
	$('#range-credit-summ').show();
	$('#range-credit-summ').rangeslider({
		polyfill: false,
		onInit: () => {
			let slider = $('#range-credit-summ');
			if (slider.hasClass('max-disabled')) {
				slider
					.parent()
					.find('.rangeslider__handle')
					.append(`<div class="rangeslider__handle__popup">${sliderText}</div>`);
			}
		},
		// Callback function
		onSlide: (position, value) => {
			let slider = $('#range-credit-summ');
			if (slider.hasClass('max-disabled')) {
				let max = +slider.attr('max');
				if (value === max) {
					slider.parent().find('.rangeslider__handle__popup').addClass('show');
				} else {
					slider.parent().find('.rangeslider__handle__popup').removeClass('show');
				}
			}
			$('.info-block__summ .value span').text(moneyFormat(value));
			$('.credit-calculate .summ-slider:not(.day-slider) .value input').val(moneyFormat(value));
			setInputWidth($('.credit-calculate .summ-slider:not(.day-slider) .value input'));
			calculateCredit(value, getDaysCount())
		}
	});

	if ($('.calculate-section').data('type') === 'with-sliders') {
		$('#range-credit-days').show();
		$('#range-credit-days').rangeslider({
			polyfill: false,

			// Callback function
			onSlide: function (position, value) {
				let date = new Date();
				date.setDate(date.getDate() + value);
				$('.calendar-checked-date span').text(weekDayNames[date.getDay()] + ', ' + date.getDate() + ' ' + monthNamesSclon[date.getMonth()]);
				setInputWidth($('.credit-calculate .day-slider .value input'));
				$('.day-slider .value > input').val(value);
				calculateCredit(getSumm(), value)
			}
		});
	}

	$('.fast-file').on('change', function () {
		var file = $(this)[0].files;
		if (file.length > 0) {
			$(this).closest('.input').find('.state').hide();
			$(this).closest('.input').find('label').text('Файл загружен');
		} else {
			$(this).closest('.input').find('.state').show();
			$(this).closest('.input').find('label').text('Выбрать файл');
		}
	});
});

function moneyFormat(price) {
	return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
}

function setInputWidth(input) {
	let buffer = input.parent().find('.input-buffer');
	buffer.text(input.val());
	let bufferWidth = buffer.width();
	input.width(bufferWidth);
}

let showSocialAnimationTimeOut, fastSocialIconsAnimationInterval;

$(document).delegate('.fast-social__button', 'click', e => {
	let _this = $(e.currentTarget),
		parent = _this.closest('.fast-social');
	let isShow = parent.hasClass('fast-social__show');
	if (isShow) {
		parent.removeClass('fast-social__show');
		hideFastSocialPopup();
	} else {
		parent.addClass('fast-social__show');
		showFastSocialPopup();
	}
});

$(document).delegate('body', 'click', function (event) {
	if (!$(event.target).closest('.fast-social, .fast-social__button').length) {
		let isShow = $('#fast-social').hasClass('fast-social__show');
		if (isShow) {
			$('#fast-social').removeClass('fast-social__show');
			hideFastSocialPopup();
		}
	}
});

function showFastSocialPopup() {
	$('.fast-social__button--inner .static, .fast-social__button--inner .icons').addClass('hide');
	$('.fast-social__button--inner .close').removeClass('hide');
	clearInterval(fastSocialIconsAnimationInterval);
	clearTimeout(showSocialAnimationTimeOut);
}

function hideFastSocialPopup() {
	$('.fast-social__button--inner .static').removeClass('hide');
	$('.fast-social__button--inner .close').addClass('hide');
	resetFastSocialIconsLine();
	startFastSocialAnimation();
}

$(window).on('load', () => {
	animateFastSocialIcons();
});

function animateFastSocialIcons() {
	clearTimeout(showSocialAnimationTimeOut);
	let iconsLength = $('.fast-social__button--inner .icons__line span').length;
	let iconCount = 1;
	let transform = -4;
	fastSocialIconsAnimationInterval = setInterval(() => {
		if (iconCount === iconsLength) {
			clearInterval(fastSocialIconsAnimationInterval);
			$('.fast-social__button--inner .icons').addClass('hide');
			$('.fast-social__button--inner .static').removeClass('hide');
			resetFastSocialIconsLine();
			startFastSocialAnimation();
		} else {
			$('.fast-social__button--inner .icons__line').css({
				'transform': 'translateX(' + transform + 'em)',
				'-moz-transform': 'translateX(' + transform + 'em)',
				'-webkit-transform': 'translateX(' + transform + 'em)'
			});
			transform -= 4.25;
			iconCount++;
		}
	}, 1000);
}

function startFastSocialAnimation() {
	showSocialAnimationTimeOut = setTimeout(() => {
		$('.fast-social__button--inner .icons').removeClass('hide');
		$('.fast-social__button--inner .static').addClass('hide');
		animateFastSocialIcons();
	}, 2000);
}

function resetFastSocialIconsLine() {
	$('.fast-social__button--inner .icons__line').css({
		'transform': 'translateX(0.25em)',
		'-moz-transform': 'translateX(0.25em)',
		'-webkit-transform': 'translateX(0.25em)'
	});
}

function startTimer(element, countDownDate) {
	// Update the count down every 1 second
	timerInterval = setInterval(() => {
		let hasHours = $(element).find('.hours').length > 0;
		let distance = getTimerDistance(countDownDate);
		// Time calculations for days, hours, minutes and seconds
		let clockValue = getClockValues(distance);

		// Display the result in the element
		if (hasHours) {
			$(element).find('.hours .value').text(clockValue.hours);
		}
		$(element).find('.minutes .value').text(clockValue.minutes);
		$(element).find('.seconds .value').text(clockValue.seconds);

		// If the count down is finished, write some text 
		if (distance < 0) {
			clearInterval(timerInterval);
		}
	}, 1000);
}

function getClockValues(distance) {
	let clockValues = {};
	clockValues.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	clockValues.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	clockValues.seconds = Math.floor((distance % (1000 * 60)) / 1000);
	$.each(clockValues, (indexInArray, valueOfElement) => {
		if (valueOfElement.toString().length < 2) {
			clockValues[indexInArray] = `0${valueOfElement}`;
		}
	});
	return clockValues;
}

function getTimerDistance(countDownDate) {
	// Get todays date and time
	let now = new Date().getTime();
	// Find the distance between now an the count down date
	let distance = countDownDate - now;
	return distance;
}

function restrictToInteger() {
	this.value = this.value.replace(/[^\d]/g, '');
}

function calculateCredit(summ, dateCount) {
	let commission = summ * creditDatas.commission;
	let calculatedSumm = summ + (summ * (dateCount * creditDatas.dailyRate)) + commission;
	commission = commission.toFixed(2);
	commission = +commission;
	$('.info-block__commission .value span').text(moneyFormat(commission)); // Refresh commission
	$('.info-block__payment span').text(moneyFormat(calculatedSumm)); // End summ
}

function getDaysCount() {
	return +$('#range-credit-days').val();
}

function getSumm() {
	return +$('#range-credit-summ').val();
}