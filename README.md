Presentation tracker
====================

Simple HTML+JS+CSS application that tracks the progress of the live presentation being conducted and allows to track time and next topics.
It displays nicely on mobile devices amd supports different languages.
It can be easily configured in JSON file.
The project is in WIP state. The Start/Stop functionality is not implemented yet.

Usage
-----
Prepare your presentation in JSON format according to example in `data.js` file.
Run `index.html` in your favorite browser and click `Start` button to start tracking your live presentation.

Data
----
The presentation is represented in JSON file as `presentation` object which contains `modules`.
A presentation has its `title`, `subtitle`, `duration` in minutes, `date`.
Modules properties are: `label` which is a name od the module, `duration` in minutes, `color` of the progress bar, `type` and list of `topics`.
There are different types of modules: `module` and special `break` type which has clock icon on the progress bar.
Modules of type `module` can also contain `topics` represented by `label` and `duration`.
If the duration of topics does not equal to module duration, the proper error will be displayed. The same happens for the modules and the presentation.

Languages
---------
The application supports different languages. Currently it has translations for the UI elements in Polish and English.
Additional languages can be easily added in `language.js` file. the language can be changed by dropdown list in the top right corner of the application.
