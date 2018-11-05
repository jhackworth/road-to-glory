var dynamicGD = new Vue({
    el: '#dynamicGDContainer',
    data: {
        appType: 'editor',
        appOptions: {
            winHeight: 350,
            winTitle: 'myFile.js',
            promptString: '$',
            onCompleteDelay: 1000 
        },
        actionConfig: {
            actionType: null,
            newPrompt: null,
            newDelay: null,
            highlightCode: false,
            highlightLang: 'javascript'
        },
        rawActions: [],
        actions: [],
        editing: {
            status: false,
            index: null
        }
    },
    computed: {
        openAction() {
            var o = {};
            o.wh = this.appOptions.winHeight;
            o.wt = this.appOptions.winTitle;
            o.ps = this.appOptions.promptString;
            o.ocd = this.appOptions.onCompleteDelay;
            return `.openApp('${this.appType}', {\n\tminHeight: '${o.wh}px',\n\twindowTitle: '${o.wt}',\n\tpromptString: '${o.ps}',\n\tonCompleteDelay: ${o.ocd}\n})\n`;
        },
        disablePromptStringFieldAction() {
            return this.actionConfig.actionType != 'command';
        },
        disablePromptStringFieldWindow() {
            return this.appType == 'editor' ? true : false;
        },
        invalidateActionTypes() {
            if (this.appType == 'editor' && this.actionConfig.actionType != 'write') {
                return "form-control is-invalid"
            }
            else if (this.appType == 'terminal' && (this.actionConfig.actionType == 'write' || this.actionConfig.actionType == null)) {
                return "form-control is-invalid"
            }
            else {
                return "form-control"
            }
        },
        invalidateHighlight() {
            if (this.actionConfig.highlightCode && this.actionConfig.highlightLang == null) {
                return "form-control-sm is-invalid";
            }
            else {
                return "form-control-sm";
            }
        },
        disableHighlightLangs() {
            return !this.actionConfig.highlightCode;
        }
    },
    methods: {
        createAction(type) {
            var c = type;

            if (c) {
                var actionObject = {
                    type: c,
                    val: document.getElementById('actionInput').value,
                    prompt: this.actionConfig.newPrompt ? this.actionConfig.newPrompt : this.appOptions.promptString,
                    delay: this.actionConfig.newDelay ? this.actionConfig.newDelay : this.appOptions.onCompleteDelay
                }

                // Add highlight if checked
                if (this.actionConfig.highlightCode) {
                    var high = `Prism.highlight(\`${actionObject.val}\`, Prism.languages.${this.actionConfig.highlightLang}, '${this.actionConfig.highlightLang}')`;
                    actionObject.highlightVal = high;
                }

                if (c == 'write' || c == 'respond') {
                    if (actionObject.highlightVal) {
                        var c2 = `.${c}(${actionObject.highlightVal}, { onCompleteDelay: ${actionObject.delay} })\n`;
                    }
                    else {
                        var c2 = `.${c}(\`${actionObject.val}\`, { onCompleteDelay: ${actionObject.delay} })\n`;
                    }
                    var rc = {...actionObject};
                    if (this.editing.status) {
                        dynamicGD.$set(dynamicGD.actions, this.editing.index, c2);
                        dynamicGD.$set(dynamicGD.rawActions, this.editing.index, rc);
                    }
                    else {
                        this.actions.push(c2);
                        this.rawActions.push(rc);
                    }
                }
                else if (c == 'command') {
                    if (actionObject.highlightVal) {
                        var c2 = `.${c}(${actionObject.highlightVal}, { promptString: '${actionObject.prompt}', onCompleteDelay: ${actionObject.delay} })\n`;
                    }
                    else {
                        var c2 = `.${c}(\`${actionObject.val}\`, { promptString: '${actionObject.prompt}', onCompleteDelay: ${actionObject.delay} })\n`;
                    }
                    
                    var rc = {...actionObject};
                    if (this.editing.status) {
                        dynamicGD.$set(dynamicGD.actions, this.editing.index, c2);
                        dynamicGD.$set(dynamicGD.rawActions, this.editing.index, rc);
                    }
                    else {
                        this.actions.push(c2);
                        this.rawActions.push(rc);
                    }
                }
                this.editActionForm('clear');
            }
        },
        editAction(i) {
            var c = this.rawActions[i];
            c.i = i;
            this.editActionForm('edit', c);
        },
        deleteAction(i) {
            this.rawActions.splice(i, 1);
            this.actions.splice(i, 1);
            this.editActionForm('clear')
        },
        editActionForm(action, c) {
            var editForm = action == 'edit' ? true : false;
            // Update form
            this.actionConfig.newPrompt = editForm ? c.prompt : null;
            this.actionConfig.newDelay = editForm ? c.delay : null;
            this.actionConfig.actionType = editForm ? c.type : null;
            this.actionConfig.highlightVal = editForm ? c.highlightVal : null;
            document.getElementById('actionInput').value = editForm ? c.val : "";
            this.actionConfig.highlightCode = editForm && c.highlightVal ? true : false;
            // Set Editing Status
            this.editing.status = editForm ? true : false;
            this.editing.index = editForm ? c.i : null;
        },
        startOver() {
            this.rawActions = [],
            this.actions = [],
            this.editActionForm('clear');
        },
        compileFunction(returnType) {
            var setup1 = `const gDemo = new GDemo('[data-demo-container]');\n\ngDemo\n`;
            var setup2 = `const gDemo = new GDemo('#container');\n\ngDemo\n`;
            var open = this.openAction;
            var end = `.end();`;
            if (returnType == 'preview') {
                var link = 'https://glorious.codes/demo?demo=' + btoa(setup1 + open + this.actions.join('') + end)
                window.open(link);
                return link;
            }
            else {
                console.log(setup2 + open + this.actions.join('') + end);
                return setup2 + open + this.actions.join('') + end;
            }
        }
    }
})