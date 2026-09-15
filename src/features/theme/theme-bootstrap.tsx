const themeBootstrapSource = `(function(){var e=document.documentElement;var m=function(){return matchMedia("(prefers-color-scheme: dark)").matches};try{var k="controle-financeiro-theme";var p=localStorage.getItem(k);if(p!=="light"&&p!=="dark"&&p!=="system")p="system";var d=p==="dark"||(p==="system"&&m());e.classList.toggle("dark",d);e.dataset.theme=p;e.style.colorScheme=d?"dark":"light"}catch(x){var d=m();e.classList.toggle("dark",d);e.dataset.theme="system";e.style.colorScheme=d?"dark":"light"}})()`;

export function ThemeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: themeBootstrapSource }} />;
}
