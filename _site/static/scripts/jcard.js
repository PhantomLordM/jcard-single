/*
 * Interactive j-card template logic.
 */
var jcard = (function() {
    // find input elements in the controls module
    function findInputs(controls) {
        return {
            print2:     controls.querySelector('#controls-print-2'),
            forceCaps:  controls.querySelector('#controls-force-caps'),
            shortBack:  controls.querySelector('#controls-short-back'),

            cover:      controls.querySelector('#controls-cover'),
            cardColor:  controls.querySelector('#controls-card-color'),
            textColor:  controls.querySelector('#controls-text-color'),

            title:      controls.querySelector('#controls-title'),
            subtitle:   controls.querySelector('#controls-subtitle'),
            titleSize:  controls.querySelector('#controls-title-size'),

            type:       controls.querySelector('#controls-type'),
            typeSize:   controls.querySelector('#controls-type-size'),

            noteUpper:  controls.querySelector('#controls-note-upper'),
            noteLower:  controls.querySelector('#controls-note-lower'),
            noteSize:   controls.querySelector('#controls-note-size'),

            sideA:      controls.querySelector('#controls-side-a'),
            sideB:      controls.querySelector('#controls-side-b'),
            trackSize:  controls.querySelector('#controls-track-size'),
            backSize:   controls.querySelector('#controls-back-size')
        }
    }

    // find output elements in the template module
    function findOutputs(template) {
        return {
            root:           template,
            boundaries:     template.querySelector('.template-boundaries'),
            cover:          template.querySelector('.template-cover'),
            titleGroups:    [
                template.querySelector('.template-front-title-group'),
                template.querySelector('.template-spine-title-group')],
            titles:         [
                template.querySelector('.template-front-title'),
                template.querySelector('.template-spine-title')],    
            subtitles:      [
                template.querySelector('.template-front-subtitle'),
                template.querySelector('.template-spine-subtitle')],
            tracks:         template.querySelector('.template-tracks'),
            type:           template.querySelector('.template-type'),
            noteGroup:      template.querySelector('.template-note-group'),
            noteUpper:      template.querySelector('.template-note-upper'),
            noteLower:      template.querySelector('.template-note-lower'),
            sideA:          template.querySelector('.template-side-a'),
            sideB:          template.querySelector('.template-side-b')
        }
    }

    // add listeners to inputs that toggle option classes
    function addOptionListeners(inputs, root) {
        addToggleListener(inputs.print2, root, 'print-2');
    }

    // add listeners to inputs that update j-card outputs
    function addJCardListeners(inputs, outputs) {
        addToggleListener(inputs.shortBack, outputs.root, 'short-back');
        addToggleListener(inputs.forceCaps, outputs.root, 'force-caps');

        addImageListener(inputs.cover, outputs.cover);
        addColorListener(inputs.textColor, outputs.root, 'color');
        addColorListener(inputs.cardColor, outputs.boundaries, 'backgroundColor');

        outputs.titles.forEach(function(titleOutput) {
            addTextListener(inputs.title, titleOutput);
        });
        outputs.subtitles.forEach(function(subtitleOutput) {
            addTextListener(inputs.subtitle, subtitleOutput);
        });
        outputs.titleGroups.forEach(function(groupOutput) {
            addSizeListener(inputs.titleSize, groupOutput);
        });

        addTextListener(inputs.type, outputs.type);
        addSizeListener(inputs.typeSize, outputs.type);

        addTextListener(inputs.noteUpper, outputs.noteUpper);
        addTextListener(inputs.noteLower, outputs.noteLower);
        addSizeListener(inputs.noteSize, outputs.noteGroup);

        addSideListener(inputs.title, outputs.sideA);
        addSideListener(inputs.title, outputs.sideB);
        addTracksListener([inputs.sideA, inputs.sideB], outputs.tracks);
        addSizeListener(inputs.trackSize, outputs.tracks);
        addSizeListener(inputs.backSize, outputs.sideA);
        addSizeListener(inputs.backSize, outputs.sideB);
    }

    // populate inputs with field values or defaults
    function populate(inputs, fields) {
        inputs.shortBack.checked = fields.short_back !== undefined ? fields.short_back : true;

        inputs.cardColor.value = fields.card_color || 'white';
        inputs.textColor.value = fields.text_color || 'black';

        inputs.title.value = fields.title || '';
        inputs.subtitle.value = fields.subtitle || '';
        inputs.titleSize.value = fields.title_size || 8;

        inputs.type.value = fields.type || '               ';
        inputs.typeSize.value = fields.type_size || 8;

        inputs.noteUpper.value = fields.note_upper || 'Nakamichi';
        inputs.noteLower.value = fields.note_lower || 'LX-5';
        inputs.noteSize.value = fields.note_size || 8;

        inputs.sideA.value = formatList(fields.side_a || []);
        inputs.sideB.value = formatList(fields.side_b || []);
        inputs.trackSize.value = fields.track_size || 9;
        inputs.backSize.value = fields.back_size || 8;
    }

    // trigger listener calls on all fields
    function update(inputs) {
        for (name in inputs) {
            var input = inputs[name];
            var event = document.createEvent('Event');
            if (input.type === 'checkbox' || input.type === 'file') {
                event.initEvent('change', true, true);
            } else {
                event.initEvent('input', true, true);
            }
            input.dispatchEvent(event);
        }
    }

    // copy an input value to an output innerHTML on input change
    function addTextListener(input, output) {
        input.addEventListener('input', function(event) {
            output.innerHTML = input.value;
        });
    }

    // toggle a class on an output element when an input is checked
    function addToggleListener(input, output, toggleClass) {
        input.addEventListener('change', function(event) {
            if (input.checked) {
                output.classList.add(toggleClass);
            } else {
                output.classList.remove(toggleClass);
            }
        });
    }

    // set the font size of an output element to the input value on change
    function addSizeListener(input, output) {
        input.addEventListener('input', function(event) {
            output.style.fontSize = input.value + 'pt';
        });
    }

    // set a property of the output element's style to a color on change
    function addColorListener(input, output, property) {
        input.addEventListener('input', function(event) {
            output.style[property] = input.value;
        });
    }

    // set the src property of an image when a file is selected
    function addImageListener(input, output) {
        input.addEventListener('change', function(event) {
            var file = input.files[0];
            if (file) {
                output.src = URL.createObjectURL(file);
            }
        });
    }

    // format an input list and set an output innerHTML on input change
    function addSideListener(input, output) {
        input.addEventListener('input', function(event) {
            output.innerHTML = formatListText(input.value);
        });
    }

    // combine and format input lists and set output innerHTML on any input change
    function addTracksListener(inputs, output) {
        inputs.forEach(function(input) {
            input.addEventListener('input', function(event) {
                var rawSides = inputs.map(function(input) { return input.value; });
                var rawTracks = formatList(rawSides);
                output.innerHTML = formatListText(rawTracks);
            });
        });
    }

    // convert a list to a newline delimited string
    function formatList(list) {
        return list.join('\n');
    }

    // convert a newline delimited string to a bullet delimited string
    function formatListText(listText) {
        return listText.trim().replace(/\s*\n\s*/g, '&nbsp;• ');
    }

    return {
        init: function(selector, fields) {
            var root = document.querySelector(selector);

            // find controls
            var controls = root.querySelector('#controls');
            var inputs = findInputs(controls);

            // find preview template
            var previewTemplate = root.querySelector('.jcard-preview .template');
            var previewOutputs = findOutputs(previewTemplate);

            // create duplicate template to be shown only when printed
            var dupeContainer = root.querySelector('.jcard-duplicate');
            var dupeTemplate = previewTemplate.cloneNode(true);
            var dupeOutputs = findOutputs(dupeTemplate);
            dupeContainer.appendChild(dupeTemplate);

            // register listeners
            addOptionListeners(inputs, root);
            addJCardListeners(inputs, previewOutputs);
            addJCardListeners(inputs, dupeOutputs);

            // initialize inputs and templates
            populate(inputs, fields);
            update(inputs);
        }
    }
})();
