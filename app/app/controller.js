const ControllerSupport = {
    init() {
        if (!("getGamepads" in navigator)) return console.log('Not supported');
        this.canvas = null;
        this.connected = false;

        this.controls = { // NAME: INPUT(CONTROLLER CODE), KEY_CODE, PRESSED, MOUSE
            JUMP: { INPUT: 0, CODE: parseInt(getSavedVal("cont_jumpKey") || 32), PRESSED: false },
            RELOAD: { INPUT: 2, CODE: parseInt(getSavedVal("cont_reloadKey") || 82), PRESSED: false },
            SWAP_UP: { INPUT: 4, CODE: parseInt(getSavedVal("cont_swapKeyU") || 69), PRESSED: false },
            SWAP_DOWN: { INPUT: 5, CODE: parseInt(getSavedVal("cont_swapKeyD") || 81), PRESSED: false },
            AIM: { INPUT: 6, CODE: parseInt(getSavedVal("cont_aimKey") || 67), PRESSED: false, MOUSE: true},
            CROUCH: { INPUT: 11, CODE: parseInt(getSavedVal("cont_crouchKey") || 16), PRESSED: false },
            CHAT: { INPUT: 12, CODE: parseInt(getSavedVal("cont_chatKey") || 13), PRESSED: false },
            SPRAY: { INPUT: 13, CODE: parseInt(getSavedVal("cont_sprayKey") || 70), PRESSED: false },
            VOICE: { INPUT: 15, CODE: parseInt(getSavedVal("cont_voiceKey") || 86), PRESSED: false },
            RECORD: { INPUT: 14, CODE: parseInt(getSavedVal("cont_recordKey") || 84), PRESSED: false },
            FOWARD: { INPUT: [1, -0.3], CODE: parseInt(getSavedVal("cont_0") || 87), PRESSED: false },
            BACK: { INPUT: [1, 0.3], CODE: parseInt(getSavedVal("cont_1") || 83), PRESSED: false },
            LEFT: { INPUT: [0, -0.3], CODE: parseInt(getSavedVal("cont_2") || 65), PRESSED: false },
            RIGHT: { INPUT: [0, 0.3], CODE: parseInt(getSavedVal("cont_3") || 68), PRESSED: false },
            SHOOT: { INPUT: 7, CODE: null, PRESSED: false, MOUSE: true },
            //START: { INPUT: 9, CODE: null, PRESSED: false },
        };

        this.canvas = this.getCanvas();
        
		window.addEventListener("gamepadconnected", function() {
            ControllerSupport.connected = true;
            requestAnimationFrame(ControllerSupport.update);
        });
		window.addEventListener("gamepaddisconnected", function() {
            ControllerSupport.connected = false;
        });
    },

	update() {
        if (!ControllerSupport.connected) return;
        let gamepad = navigator.getGamepads()[0];
        let controls = ControllerSupport.controls;
        
        for (let key in controls) {
            let control = controls[key];
            if (control.MOUSE) continue;
            
            let curPressed = false;
            if (Array.isArray(control.INPUT)) {
                curPressed = control.INPUT[1] > 0 ? (gamepad.axes[control.INPUT[0]] > control.INPUT[1]) : (gamepad.axes[control.INPUT[0]] < control.INPUT[1]);
            } else {
                curPressed = gamepad.buttons[control.INPUT].pressed;
            }
            
            if (curPressed) { // Currently Pressed
                ControllerSupport.simulateKeyboard(control);
            } else if (control.PRESSED) { // Was Pressed
                ControllerSupport.simulateKeyboard(control, 'keyup');
            }
        }
        
        if (gamepad.buttons[controls.AIM.INPUT].value > 0.5) {
            ControllerSupport.simulateMouse(controls.AIM, "mousedown", 0, 0, 2);
        } else if (controls.AIM.PRESSED) {
            ControllerSupport.simulateMouse(controls.AIM, "mouseup", 0, 0, 2);
        }
        
        if (gamepad.buttons[controls.SHOOT.INPUT].value > 0.5) {
            ControllerSupport.simulateMouse(controls.SHOOT, "mousedown");
        } else if (controls.SHOOT.PRESSED) {
            ControllerSupport.simulateMouse(controls.SHOOT, "mouseup");
        }

        ControllerSupport.simulateMouse(null, "mousemove", ControllerSupport.applyDeadzone(gamepad.axes[2], 0.25) * 30, ControllerSupport.applyDeadzone(gamepad.axes[3], 0.25) * 27.5);
		requestAnimationFrame(ControllerSupport.update);
	},

    simulateKeyboard(control, type = 'keydown') {
        window.dispatchEvent(new KeyboardEvent(type, {
            which: control.CODE,
            keyCode: control.CODE,
            bubbles: true
        }));

        control.PRESSED = (type == 'keydown');
    },

    simulateMouse(control, type, x = 0, y = 0, which = 0) {
        this.canvas.dispatchEvent(new MouseEvent(type, {
            bubbles: true,
            cancelable: false,
            movementX: x,
            movementY: y,
            button: which,
            relatedTarget: null
        }));

        if (control) control.PRESSED = (type == 'mousedown');
    },

	applyDeadzone(number, threshold) {
		let percentage = (Math.abs(number) - threshold) / (1 - threshold);
		if(percentage < 0) percentage = 0;
		return percentage * (number > 0 ? 1 : -1);
	},

    getCanvas() {
        let query = document.querySelectorAll('canvas');
        return query[query.length - 1];
    }
};

module.exports = ControllerSupport;