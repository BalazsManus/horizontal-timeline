const dates = document.getElementById('MAIN-DATES');
const datetemplate = '<li><a href="#0" data-date="%date%" class="%type%">%format_date%</a></li>';

const data = document.getElementById('MAIN-DATA');
const date_normal = 'cd-h-timeline__date';
const date_sel = 'cd-h-timeline__date cd-h-timeline__date--selected';

const datatemplate = `<li class="%datatype%">
    <div class="cd-h-timeline__event-content container">
    <h2 class="cd-h-timeline__event-title">%title%</h2>
    <em class="cd-h-timeline__event-date">%date%</em>
    <p class="cd-h-timeline__event-description color-contrast-medium"> 
        <iframe id="%iframeid%"  src="/md.htm?src=%path%" width="100%"></iframe>
    </p>
    </div>
    </li>`;

const data_normal = 'cd-h-timeline__event text-component';
const data_sel = 'cd-h-timeline__event cd-h-timeline__event--selected text-component';

window.onload = async function() {
    try {
        const response = await fetch('/api/entries');
        const files = await response.json();
        const lastIndex = files.length - 1;
        for (const [index, file] of files.entries()) {
            let title, date, dateformatted;
            
            title = file.replace('.md', '');
            
            try {
                const dateResponse = await fetch(`/api/entries/date?file=${file}`);
                const dateStr = await dateResponse.text();
                date = dateStr;
                const [day, month, year] = dateStr.split('/');
                const date2 = new Date(`${year}-${month}-${day}`);
                dateformatted = date2.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: undefined
                });
            } catch (error) {
                console.error('Error fetching file date:', error);
            }
            
            const type = index === lastIndex ? date_sel : date_normal;
            const datatype = index === lastIndex ? data_sel : data_normal;
            
            const editeddate = datetemplate
                .replace('%date%', date)
                .replace('%format_date%', dateformatted)
                .replace('%type%', type);
            dates.innerHTML += editeddate;
            const editeddata = datatemplate
                .replace('%title%', title)
                .replace('%date%', date)
                .replace('%path%', encodeURIComponent(file))
                .replace('%iframeid%', encodeURIComponent(file))
                .replace('%datatype%', datatype);
            data.innerHTML += editeddata;
        }
    } catch (error) {
        console.error('Error fetching entries:', error);
    }
    
    function loadScript(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => callback();
        document.body.appendChild(script);
    }
    
    function loadScriptsSequentially(scripts, index = 0) {
        if (index < scripts.length) {
            loadScript(scripts[index], () => loadScriptsSequentially(scripts, index + 1));
        }
    }
    
    function loadAdditionalScripts() {
        const scriptsToLoad = [
            '/assets/js/util.js',
            '/assets/js/swipe-content.js',
            '/assets/js/main.js'
        ];
        loadScriptsSequentially(scriptsToLoad);
    }
    
    loadAdditionalScripts();
};

window.addEventListener('message', function(event) {
    if (event.data.iframeHeight && event.data.iframeId) {
        const iframe = document.getElementById(event.data.iframeId);
        if (iframe) {
            iframe.style.height = `${event.data.iframeHeight}px`;
        }
    }
}, false);