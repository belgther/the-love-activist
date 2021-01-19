var currentStep = -2;
		var currentLetter = -1;
		var currentAnimationId = -1;
		var attitudePoints = 0;
		
		function getCurrentLanguage() {
			var currentLanguage = getLocalStorage().getItem('currentLanguage');
			if (currentLanguage == null || currentLanguage.trim() == '') {
				currentLanguage = window.navigator.language;
			}
			if (translations[currentLanguage] == null) {
				currentLanguage = 'en';
			}
			return currentLanguage;
		}
		
		function getSpeed() {
			var speed = getLocalStorage().getItem('speed');
			if (speed == null || speed.trim() == '') {
				speed = '1';
			}
			return parseInt(speed, 10);
		}
		
		function setSpeed(speed) {
			getLocalStorage().setItem('speed', speed + '');
		}
		
		function getLocalStorage() {
		    if (window.localStorage != null) {
		        return window.localStorage;
		    } else if (localStorage != null) {
		        return localStorage;
		    } else {
		        return {
		            getItem: function() {

		            },
		            setItem: function(key, value) {

		            }
		        };
		    }
		}
		
		function renderCurrentStep() {
			//document.getElementById('cookieWarning').style.display = (currentStep === -2) ? '' : 'none';
			document.getElementById('menu').style.display = (currentStep === -1) ? '' : 'none';
			document.getElementById('content').style.display = (currentStep > -1) ? '' : 'none';
			var savedStep = getLocalStorage().getItem('currentStep');
			document.getElementById('continue').style.display = (savedStep != null && parseInt(savedStep) > 0) ? '' : 'none';
			if (currentStep >= 0) {
				currentLetter = 0;
				document.getElementById('buttons').innerHTML = '';
				typeCurrentStep();
			} else {
				document.getElementById('gameTitle').innerHTML = translations[getCurrentLanguage()]['gameTitle'];
				document.getElementById('newGameButton').innerHTML = translations[getCurrentLanguage()]['newGame'];
				document.getElementById('continue').innerHTML = translations[getCurrentLanguage()]['continue'];
				document.getElementById('speedTitle').innerHTML = translations[getCurrentLanguage()]['textSpeed'];
			}
		}
		
		function setCurrentStep(step) {
			currentStep = step;
			if (steps[currentStep] == null) {
				currentStep = -1;
				getLocalStorage().setItem('currentStep', null);
				getLocalStorage().setItem('attitudePoints', '0');
			} else {
				getLocalStorage().setItem('currentStep', currentStep);
				getLocalStorage().setItem('attitudePoints', attitudePoints);
				if (steps[currentStep].attitudeStart) {
					attitudePoints = 0;
				}
			}

			renderCurrentStep();
		}
		
		function typeCurrentStep() {
			var entireText = translations[getCurrentLanguage()][steps[currentStep].text];
			var currentText = entireText.substring(0, currentLetter).split('\n').join('<br/>');
			document.getElementById('textToShow').innerHTML = currentText;
			if (currentLetter <= entireText.length) {
				currentLetter += getSpeed();
				currentAnimationId = requestAnimationFrame(typeCurrentStep);
			} else {
				cancelAnimationFrame(currentAnimationId);
				displayStepButtons();
			}
		}
		
		function displayStepButtons() {
			var choices = steps[currentStep].choices;
			if (choices == null || choices.length === 0) {
				document.getElementById('buttons').appendChild(createButtonWithText('&lt;' + translations[getCurrentLanguage()]['continue'] + '&gt;', function() {
				    setCurrentStep(currentStep + 1);
				}));
			} else {
				choices.forEach(choice => {
				    if (choice.maxAttitude != null && attitudePoints > choice.maxAttitude) {
				        return;
				    }
				    if (choice.minAttitude != null && attitudePoints < choice.minAttitude) {
				        return;
				    }
					document.getElementById('buttons').appendChild(createButtonWithText(translations[getCurrentLanguage()][choice.text], function() {
					    if (choice.attitudePoints != null) {
					        attitudePoints += choice.attitudePoints;
					    }
					    setCurrentStep(currentStep + choice.forward);
					}));
				});
			}
		}
		
		function createButtonWithText(buttonText, fn) {
			var btn = document.createElement('div');
			btn.classList.add('btn');
			btn.innerHTML = buttonText;
			btn.onclick = fn;
			return btn;
		}
		
		function loadGame() {
			attitudePoints = parseInt(window.localStorage.getItem('attitudePoints'));
			if (attitudePoints < 0 || attitudePoints > 100) {
				attitudePoints = 0;
			}
			setCurrentStep(parseInt(window.localStorage.getItem('currentStep')));
		}