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

<div st:xtype="panel" title="Forms" id="forms" ng:controller="FormController" scroll="true">

    <div st:xtype="textfield" name="text" label="Text"></div>

    <div st:xtype="fieldset" title="Personal Info" instructions="Please enter the information above."
         defaults.required="true" defaults.label-align="left" defaults.label-width="40%">


        <div st:xtype="textfield" name="name" label="Name" user-clear-icon=true auto-capitalize=false></div>
        <div st:xtype="passwordfield" name="password" label="Password" user-clear-icon=false></div>
        <div st:xtype="textfield" name="disabled" label="Disabled" disabled=true user-clear-icon=true></div>
        <div st:xtype="emailfield" name="email" label="Email" place-holder="you@sencha.com" user-clear-icon=true></div>
        <div st:xtype="urlfield" name="url" label="Url" place-holder="http://sencha.com" user-clear-icon=true></div>
        <div st:xtype="checkboxfield" name="cool" label="Cool" value=true></div>
        <div st:xtype="spinnerfield" name="spinner" label="Spinner"></div>
        <div st:xtype="selectfield" name="rank" label="Rank">
            <st:option ng:repeat="rank in rankStore" value="{{rank.rank}}" text="{{rank.title}}"></st:option>
        </div>
        <div st:xtype="hiddenfield" name="secret" value="false"></div>
        <div st:xtype="textareafield" name="bio" label="Bio" max-length="60" max-rows="10"></div>
        <div st:xtype="sliderfield" name="height" label="Height"></div>
        <div st:xtype="togglefield" name="enable" label="Security Mode"></div>
        <div st:xtype="radiofield" name="team" label="Red Team" value="redteam"></div>
        <div st:xtype="radiofield" name="team" label="Blue Team" value="blueteam"></div>
    </div>
    <div st:xtype="fieldset" title="Favorite color">
        <div st:xtype="radiofield" name="color" label="Red" value="red"></div>
        <div st:xtype="radiofield" name="color" label="Green" checked=true value="green"></div>
    </div>
    <div st:xtype="fieldset" title="HTML5">
        <div st:xtype="numberfield" name="number" label="Number" max-value="20" min-value="2"></div>
        <div st:xtype="emailfield" name="email2" label="Email" user-clear-icon="true"></div>
        <div st:xtype="urlfield" name="url2" label="URL" user-clear-icon="true"></div>
    </div>

    <div st:xtype="fieldset" title="Single Select (in fieldset)">
        <div st:xtype="selectfield" name="options">
            <st:option value="1" text="This is just a big select with text that is overflowing"></st:option>
            <st:option value="2" text="This is just a big select with text that is overflowing"></st:option>
        </div>
    </div>

    <div st:xtype="fieldset" title="Single Text (in fieldset)">
        <div st:xtype="textfield" name="single_text" user-clear-icon="true"></div>
    </div>

    <div st:xtype="fieldset" title="Single Toggle (in fieldset)">
        <div st:xtype="togglefield" name="single_toggle" value="1"></div>
    </div>
    <div st:xtype="fieldset" title="Single Slider (in fieldset)">
        <div st:xtype="sliderfield" name="single_slider" value="60"></div>
    </div>

</div>
