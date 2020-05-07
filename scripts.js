// TODO:
// startowanie i pauzowanie czasu
// obsługa zbyt podobnych kolorów tematów
// obsługa oddzielnych dni kursu (przełącznie pomiędzy innymi htmlami i danymi zależnymi od dnia)
// dodać group button do start (stop), który jest disabled, jeśli czas nie wystartował.
// dodaj glyph do przycisków start, pauzy, stopu
// popraw wyświetlanie badge na małych urządzeniach
// przesuwanie tekstu, który się nie mieści (szczególnie widok mobile)
// podświetlenie progress barów na hover
// fix hover over progress-bar

function updateLabels(){
	$(document).attr("title", data.presentation.title);
	$('#pr-title').text(data.presentation.title);
	$('#pr-subtitle').text(data.presentation.subtitle);
	$('#pr-duration').text(minsToTime(data.presentation.duration));
	let prDate = new Date(data.presentation.date).toLocaleDateString(localStorage.getItem('language'), {  
		day : 'numeric',
		month : 'long',
		year : 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
	$('#pr-time').text(prDate);
}

function createLabel(module, width, parentDiv) {
	let modLabelDiv = $('<div/>', {
		class: 'pr-label',
		text: module.label + " ",
		style: `width:${width}%;`
	});
	let badge = $('<span/>', {
		class: 'badge',
		text: module.duration + " min"
	});
	modLabelDiv.append(badge);
	modLabelDiv.appendTo(parentDiv);
}

function createProgressBars(){
	for (let module of data.presentation.modules){
		let moduleWidth = module.duration / data.presentation.duration * 100;
		createLabel(module, moduleWidth, '#pr-labels');

		let glyph = $('<span/>', {
			class : 'glyphicon'
		}).addClass('glyphicon-time');

		let progressBar = $('<div/>', {
			class: 'progress-bar',
			style: `width:${moduleWidth}%;
					background-color:${module.color} !important;`
		});
		
		if (module.type == "break") progressBar.append(glyph);
		progressBar.appendTo('#pr-progress');
	}
}

function createBreakProgressBar(module){
	createLabel(module, 100, 'mod-labels');
	
	let breakProgressBar = $('<div/>', {
		class: 'progress-bar',
		style: `width:100%;
				background-color: #cccccc !important;`
	});
	let glyph = $('<span/>', {
		class : 'glyphicon'
	}).addClass('glyphicon-time');
	breakProgressBar.append(glyph);
	breakProgressBar.appendTo('#mod-progress');
}

function createModProgressBars(module){
	if (module.type == "break") {
		createBreakProgressBar(module);
		return;
	}
	// only module type modules have topics
	for (let topic of module.topics){
		let topicWidth = topic.duration / module.duration * 100;
		createLabel(topic, topicWidth, '#mod-labels');

		let topicProgressBar = $('<div/>', {
			class: 'progress-bar',
			style: `width:${topicWidth}%; 
					background-color:${getRandomColor(module.color)} !important;`
		});
		topicProgressBar.appendTo('#mod-progress');
	}
}

function tagCurrentModule(module, startTimes) {
	let idx = data.presentation.modules.indexOf(module);
	// calculate new tag position as half of current module width
	// and adjust it by tag width
	let nextModExists = typeof startTimes[idx+1] === 'undefined';
	let nextModStartTime = nextModExists ? 100 : startTimes[idx+1];
	let newTagPosition = nextModStartTime - ((nextModStartTime - startTimes[idx]) / 2);
	let tagWidth = 20;
	$('#module-arrow').css('left', `${newTagPosition}%`).css('margin-left', `-${tagWidth}px`);
}

function updateModProgressBar(module) {
	$('#mod-progress').children('.progress-bar').remove();
	$('#mod-labels').children().remove();
	createModProgressBars(module);
}

function blinkBeforeModuleEnds(progress, startTimes, blinkFlags) {
	let firstBlink = -6,  // seconds before module ends
		blinkTimeouts = [3000, 2000, 1000],  // array with blink times after first blink
		blinkColor = 'green',
		blinkDuration = 500; // in ms
	for (var i = 1; i < startTimes.length; i++){
		if (blinkFlags[i] == true) continue; // do not blink for the first module
		let blinkTime = ((startTimes[i] / 100 * data.presentation.duration * 60) + firstBlink) / 60 / data.presentation.duration * 100;  // calculate blink time as % of module progress
		if (progress < blinkTime) return;
		$('body').effect("highlight", {color: 'green'}, 500);
		let timeout = 0;
		for (let blinkTimeout of blinkTimeouts) {
			timeout += blinkTimeout;
			setTimeout(function(){ $('body').effect("highlight", {color: blinkColor}, blinkDuration); }, timeout);
		}
		blinkFlags[i] = true;
	}
}

function getCurrentModule(progress, startTimes){
	let currentModule = null;
	for (var i = 0; i < startTimes.length; i++){
		if (progress >= startTimes[i]) currentModule = data.presentation.modules[i];
		else break;
	}
	return currentModule;
}

function calculateProgress(elapsedTime, duration) {
	let duration_ms = duration * 60 * 1000; // change to ms
	let progress = (elapsedTime / duration_ms * 100);
	return progress;
}

function updateElapsedTime(elapsedTime) {
	let prElapsedTime = new Date(0);
	prElapsedTime.setMilliseconds(elapsedTime - (60 * 60 * 1000));
	let isoElapsedTime = prElapsedTime.toISOString();
	let formattedTime = prElapsedTime.getHours() > 0
		? isoElapsedTime.substr(11, 8) // display hours and minutes
		: isoElapsedTime.substr(14, 5); // display only minutes
	$('#pr-elapsed-time').text(formattedTime);
}

function validateTopicsDuration(module){
	if (module.type == 'break') return;  // break type modules have no topics
	
	let topicsTimeSum = module.topics.reduce((a, b) => a.duration + b.duration);
	if (topicsTimeSum != module.duration) {
		$('#wrong-mod-time-warning').css('display', 'block');
	}
}

function getModulesStartTimes(){
	let startingTime = 0,
		startTimes = [],
		modulesTimeSum = 0;
	for (let module of data.presentation.modules){
		startTimes.push(startingTime)
		startingTime += module.duration / data.presentation.duration * 100;
		modulesTimeSum += module.duration;
		
		validateTopicsDuration(module);
	}
	if (modulesTimeSum != data.presentation.duration){
		$('#wrong-time-warning').css('display', 'block');
	}
	return startTimes;
}

function movePrIndicator(progress) {
	$('#pr-indicator').css('left', `${progress}%`);
	$('#pr-elapsed-part').css('width', `${progress}%`);
}

function moveModIndicator(progress) {
	$('#mod-indicator').css('left', `${progress}%`);
	$('#mod-elapsed-part').css('width', `${progress}%`);
}

function toggleStartButton(button) {
	$(button).toggleClass('btn-success');
	$(button).toggleClass('btn-warning');
	let lang = localStorage.getItem('language');
	$(button).toggleHtml(getLanguagePhrase(lang, 'pause-btn'), getLanguagePhrase(lang, 'start-btn'));
	$(button).toggleKey('start-btn', 'pause-btn');
}

$(document).ready(function() {

	updateLabels();
	createProgressBars();
	updateModProgressBar(data.presentation.modules[0]);
	var startTimes = getModulesStartTimes();
	tagCurrentModule(data.presentation.modules[0], startTimes);
	var blinkFlags = Array(startTimes.length).fill(false);
	blinkFlags[0] = true;

	var start = null,
		lastModule = null,
		elapsedModules = 0;
	
	function step(timestamp) {
		if (!start) start = timestamp;
		let elapsedTime = timestamp - start;
		
		updateElapsedTime(elapsedTime);
		
		// calculate the position of presentation progress indicator
		let prProgressPercentage = calculateProgress(elapsedTime, data.presentation.duration);
		movePrIndicator(prProgressPercentage);
		
		blinkBeforeModuleEnds(prProgressPercentage, startTimes, blinkFlags);
		let currentModule = getCurrentModule(prProgressPercentage, startTimes);

		// update module progress bar if it has changed
		if (lastModule && (currentModule != lastModule)) {
			updateModProgressBar(currentModule);
			tagCurrentModule(currentModule, startTimes);
			elapsedModules += lastModule.duration * 60 * 1000;
		}
		// subtract module duration of elapsed modules
		let modProgress = elapsedTime - elapsedModules;
		
		// calculate the position of module progress indicator
		let modProgressPercentage = calculateProgress(modProgress, currentModule.duration);
		moveModIndicator(modProgressPercentage);

		let prDuration = data.presentation.duration * 60 * 1000;  // change to ms
		if (elapsedTime < prDuration) window.requestAnimationFrame(step);
		
		lastModule = currentModule;
		
		if (prProgressPercentage >= 101) {
			$('.indicator').css('display', 'none');
			return;
		}
	};
	
	$('#start-button').click(function() {
		window.requestAnimationFrame(step);
		$('.indicator').css('display', 'block');
		$('#pr-elapsed-time').css('display', 'block');
		toggleStartButton(this);
	});
});
