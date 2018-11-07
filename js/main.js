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
            index: null,
            type: null
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
                if (c == 'window') {
                    var actionsObj = {...this.appOptions};
                    actionsObj.type = 'window';
                    actionsObj.app = this.appType;
                    
                    var c2 = `.openApp('${actionsObj.app}', {\n\tminHeight: '${actionsObj.winHeight}px',\n\twindowTitle: '${actionsObj.winTitle}',\n\tpromptString: '${actionsObj.promptString}',\n\tonCompleteDelay: ${actionsObj.onCompleteDelay} })\n`;
                    var rc = {...actionsObj};
                    if (this.editing.status) {
                        dynamicGD.$set(dynamicGD.actions, this.editing.index, c2);
                        dynamicGD.$set(dynamicGD.rawActions, this.editing.index, rc);
                    }
                    else {
                        this.actions.push(c2);
                        this.rawActions.push(rc);
                    }
                    this.editActionForm('clear');
                }
                else {
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
                        this.editActionForm('clear');
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
                        this.editActionForm('clear');
                    }
                }
            }
        },
        editAction(i, type) {
            var c = this.rawActions[i];
            c.i = i;
            if (type == 'window') {
                this.editing.type = type;
            }
            else {
                this.editing.type = 'action';
            }
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
            if (this.editing.type == 'window') {
                this.appType = editForm ? c.app : 'editor';
                this.appOptions.winHeight = editForm ? c.winHeight : 350;
                this.appOptions.winTitle = editForm ? c.winTitle : '';
                this.appOptions.promptString = editForm ? c.promptString : '';
                this.appOptions.onCompleteDelay = editForm ? c.onCompleteDelay : 1000;
            }
            else {
                this.actionConfig.newPrompt = editForm ? c.prompt : null;
                this.actionConfig.newDelay = editForm ? c.delay : null;
                this.actionConfig.actionType = editForm ? c.type : null;
                this.actionConfig.highlightVal = editForm ? c.highlightVal : null;
                document.getElementById('actionInput').value = editForm ? c.val : "";
                this.actionConfig.highlightCode = editForm && c.highlightVal ? true : false;
            }
            // Set Editing Status
            this.editing.status = editForm ? true : false;
            this.editing.index = editForm ? c.i : null;
            this.editing.type = editForm ? c.type : null;
        },
        startOver() {
            this.rawActions = [],
            this.actions = [],
            this.editActionForm('clear');
        },
        compileFunction(returnType) {
            var setup1 = `const gDemo = new GDemo('[data-demo-container]');\n\ngDemo\n`;
            var setup2 = `const gDemo = new GDemo('#container');\n\ngDemo\n`;
            // var open = this.openAction;
            var end = `.end();`;
            if (returnType == 'preview') {
                var link = 'https://glorious.codes/demo?demo=' + btoa(setup1 + this.actions.join('') + end)
                window.open(link);
                return link;
            }
            else {
                console.log(setup2 + this.actions.join('') + end);
                return setup2 + this.actions.join('') + end;
            }
        },
        loadExample(example) {
            // console.log('clicked', example);
            switch (example) {
                case 'wedeploy':
                    this.rawActions = [{"winHeight":350,"winTitle":"bash","promptString":"/yoursite $","onCompleteDelay":1000,"type":"window","app":"terminal"},{"type":"command","val":"ls","prompt":"/yoursite $","delay":1000},{"type":"respond","val":"index.html","prompt":"/yoursite $","delay":1000},{"type":"command","val":"we deploy","prompt":"/yoursite $","delay":1000},{"type":"respond","val":"> yourapp in wedeploy","prompt":"/yoursite $","delay":1000},{"type":"respond","val":"  Initializing deployment process","prompt":"/yoursite $","delay":1000,"i":5},{"type":"respond","val":"  Preparing package","prompt":"/yoursite $","delay":3000},{"type":"respond","val":"! Deployment Successful in 3s","prompt":"/yoursite $","delay":1000},{"type":"respond","val":"! Deployed hosting-yourapp.wedeploy.io","prompt":"/yoursite $","delay":1000},{"type":"command","val":"","prompt":"/yoursite $","delay":1000}];
                    this.actions = [".openApp('terminal', {\n\tminHeight: '350px',\n\twindowTitle: 'bash',\n\tpromptString: '/yoursite $',\n\tonCompleteDelay: 1000 })\n",".command(`ls`, { promptString: '/yoursite $', onCompleteDelay: 1000 })\n",".respond(`index.html`, { onCompleteDelay: 1000 })\n",".command(`we deploy`, { promptString: '/yoursite $', onCompleteDelay: 1000 })\n",".respond(`> yourapp in wedeploy`, { onCompleteDelay: 1000 })\n",".respond(`  Initializing deployment process`, { onCompleteDelay: 1000 })\n",".respond(`  Preparing package`, { onCompleteDelay: 3000 })\n",".respond(`! Deployment Successful in 3s`, { onCompleteDelay: 1000 })\n",".respond(`! Deployed hosting-yourapp.wedeploy.io`, { onCompleteDelay: 1000 })\n",".command(``, { promptString: '/yoursite $', onCompleteDelay: 1000 })\n"];
                    break;
                case 'stripe':
                    this.rawActions = [{"winHeight":"350","winTitle":"stripe.js","promptString":"$","onCompleteDelay":1000,"type":"window","app":"editor"},{"type":"write","val":"// Require the Stripe library with a test secret key.\nconst stripe = require('stripe')('sk_test_af1d56f1ad');\n\n// Create a payment from a test card token.\nconst charge = await stripe.charges.create({\n  amount: 2000,\n  currency: 'usd',\n  source: 'tok_visa',\n  description: 'My first payment'\n});\n","prompt":"$","delay":1000,"highlightVal":"Prism.highlight(`// Require the Stripe library with a test secret key.\nconst stripe = require('stripe')('sk_test_af1d56f1ad');\n\n// Create a payment from a test card token.\nconst charge = await stripe.charges.create({\n  amount: 2000,\n  currency: 'usd',\n  source: 'tok_visa',\n  description: 'My first payment'\n});\n`, Prism.languages.javascript, 'javascript')"}];
                    this.actions = [".openApp('editor', {\n\tminHeight: '350px',\n\twindowTitle: 'stripe.js',\n\tpromptString: '$',\n\tonCompleteDelay: 1000 })\n",".write(Prism.highlight(`// Require the Stripe library with a test secret key.\nconst stripe = require('stripe')('sk_test_af1d56f1ad');\n\n// Create a payment from a test card token.\nconst charge = await stripe.charges.create({\n  amount: 2000,\n  currency: 'usd',\n  source: 'tok_visa',\n  description: 'My first payment'\n});\n`, Prism.languages.javascript, 'javascript'), { onCompleteDelay: 1000 })\n"];
                    break;
                case 'nodecron':
                    this.rawActions = [{"winHeight":350,"winTitle":"cron.js","promptString":"$","onCompleteDelay":1000,"type":"window","app":"editor"},{"type":"write","val":"const cron = require('node-cron');\n\ncron.schedule('* * * * * *', function () {\n    console.log('running a task every second!');\n});\n","prompt":"$","delay":1000,"highlightVal":"Prism.highlight(`const cron = require('node-cron');\n\ncron.schedule('* * * * * *', function () {\n    console.log('running a task every second!');\n});\n`, Prism.languages.javascript, 'javascript')"},{"winHeight":350,"winTitle":"bash","promptString":"$","onCompleteDelay":1000,"type":"window","app":"terminal"},{"type":"command","val":"node ./cron.js","prompt":"$","delay":1000},{"type":"respond","val":"running a task every second!","prompt":"$","delay":1000},{"type":"respond","val":"running a task every second!","prompt":"$","delay":1000},{"type":"respond","val":"running a task every second!","prompt":"$","delay":1000},{"type":"respond","val":"running a task every second!","prompt":"$","delay":1000},{"type":"respond","val":"^C","prompt":"$","delay":1000},{"type":"command","val":"","prompt":"$","delay":1000}];
                    this.actions = [".openApp('editor', {\n\tminHeight: '350px',\n\twindowTitle: 'cron.js',\n\tpromptString: '$',\n\tonCompleteDelay: 1000 })\n",".write(Prism.highlight(`const cron = require('node-cron');\n\ncron.schedule('* * * * * *', function () {\n    console.log('running a task every second!');\n});\n`, Prism.languages.javascript, 'javascript'), { onCompleteDelay: 1000 })\n",".openApp('terminal', {\n\tminHeight: '350px',\n\twindowTitle: 'bash',\n\tpromptString: '$',\n\tonCompleteDelay: 1000 })\n",".command(`node ./cron.js`, { promptString: '$', onCompleteDelay: 1000 })\n",".respond(`running a task every second!`, { onCompleteDelay: 1000 })\n",".respond(`running a task every second!`, { onCompleteDelay: 1000 })\n",".respond(`running a task every second!`, { onCompleteDelay: 1000 })\n",".respond(`running a task every second!`, { onCompleteDelay: 1000 })\n",".respond(`^C`, { onCompleteDelay: 1000 })\n",".command(``, { promptString: '$', onCompleteDelay: 1000 })\n"];
                    break;
            }
        }
    }
})