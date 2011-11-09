<script>
    function FormController() {
        this.rankStore = [
            { rank : 'master',  title : 'Master'},
            { rank : 'padawan', title : 'Student'},
            { rank : 'teacher', title : 'Instructor'},
            { rank : 'aid',     title : 'Assistant'}
        ];
    }

</script>

<st:panel title="Forms" id="forms" ng:controller="FormController" scroll="true">

    <st:custom>
        Debug:
        {{data}}
    </st:custom>

    <st:textfield name="data.text" label="Text"></st:textfield>

    <st:fieldset title="Personal Info" instructions="Please enter the information above."
         defaults.required="true" defaults.label-align="left" defaults.label-width="40%">


        <st:textfield name="data.name" label="Name" user-clear-icon=true auto-capitalize=false></st:textfield>
        <st:passwordfield name="data.password" label="Password" user-clear-icon=false></st:passwordfield>
        <st:textfield name="data.disabled" label="Disabled" disabled=true user-clear-icon=true></st:textfield>
        <st:emailfield name="data.email" label="Email" place-holder="you@sencha.com" user-clear-icon=true></st:emailfield>
        <st:urlfield name="data.url" label="Url" place-holder="http://sencha.com" user-clear-icon=true></st:urlfield>
        <st:checkboxfield name="data.cool" label="Cool" value=true></st:checkboxfield>
        <st:spinnerfield name="data.spinner" label="Spinner"></st:spinnerfield>
        <st:selectfield name="data.rank" label="Rank" display-field="title" value-field="rank" options="[{rank: 'master', title: 'Master'},{rank: 'teacher', title: 'Instructor'}]" >
        </st:selectfield>
        <st:hiddenfield name="data.secret" value="false"></st:hiddenfield>
        <st:textareafield name="data.bio" label="Bio" max-length="60" max-rows="10"></st:textareafield>
        <st:sliderfield name="data.height" label="Height"></st:sliderfield>
        <st:togglefield name="data.securityMode" label="Security Mode"></st:togglefield>
        <st:radiofield name="data.team" label="Red Team" value="redteam"></st:radiofield>
        <st:radiofield name="data.team" label="Blue Team" value="blueteam"></st:radiofield>
    </st:fieldset>
    <st:fieldset title="Favorite color">
        <st:radiofield name="data.color" label="Red" value="red"></st:radiofield>
        <st:radiofield name="data.color" label="Green" checked=true value="green"></st:radiofield>
    </st:fieldset>
    <st:fieldset title="HTML5">
        <st:numberfield name="data.number" label="Number" max-value="20" min-value="2"></st:numberfield>
        <st:emailfield name="data.email2" label="Email" user-clear-icon="true"></st:emailfield>
        <st:urlfield name="data.url2" label="URL" user-clear-icon="true"></st:urlfield>
    </st:fieldset>

    <st:fieldset title="Single Select (in fieldset)">
        <st:selectfield name="data.options2" display-field="text" value-field="value" options="[{value:'1', text:'This is just a big select with text that is overflowing'},{value:'2',text:'This is just a big select with text that is overflowing'}]">
        </st:selectfield>
    </st:fieldset>

    <st:fieldset title="Single Text (in fieldset)">
        <st:textfield name="data.single_text" user-clear-icon="true"></st:textfield>
    </st:fieldset>

    <st:fieldset title="Single Toggle (in fieldset)">
        <st:togglefield name="data.single_toggle" value="1"></st:togglefield>
    </st:fieldset>
    <st:fieldset title="Single Slider (in fieldset)">
        <st:sliderfield name="data.single_slider" value="60"></st:sliderfield>
    </st:fieldset>

</st:panel>
