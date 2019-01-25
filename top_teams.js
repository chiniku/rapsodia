javascript:
(function() {
  'use strict';
  const sleep_sec = 0.5;
  const nth_top = 25;

  main();

  async function main() {
    goto_raid();
    await wait(raid_index_opened);
    select_team_ranking();
    await wait(rank_opened);

    const result = [];
    const push_print = push_and_print(result);
    push_print([update_time()]);
    push_print(team_ranking());
    const max_page = Math.ceil(nth_top/5) > 5 ? 5 : Math.ceil(nth_top/5);
    for (let i=2;i<=max_page;i++){
      const page_button = game_frame().querySelector(`#asyPager > ul > li > a[data-paging="${i}"]`);
      if (page_button) {
        page_button.click();
        await wait(target_page_opened(i));
        push_print(team_ranking());
      }
      else {
        console.log("no button for page: ", i);
        return;
      }
    }
    window.prompt("Copy to clipboard: Ctrl+C, Enter", result.join('\n'));
  }

  function push_and_print(result_array){
    return (element_array) => {
      element_array.forEach(x=>{
        result_array.push(x);
        console.log(x)
      });
    }
  }

  function goto_raid(){
    const query_string = "?action=home_raid_index&guid=ON";
    change_search_params(query_string);
  }

  function raid_index_opened(){
    const params = new URLSearchParams(game_window().location.search);
    return not_now_loading() && params.get('action') === "home_raid_index";
  }

  function select_team_ranking(){
    game_frame().querySelectorAll('#container > div > section > div.bg_teamrank > div.padding05 > div > a[href*="action=home_raid_ranking"]')[0].click();
  }

  function rank_opened(){
    const params = new URLSearchParams(game_window().location.search);
    return not_now_loading() && params.get('action') === "home_raid_ranking";
  }

  function update_time(){
    const update_time = game_frame().querySelector('#container > section > div > div > div.tit_common01:first-child')
                                    .innerText
                                    .replace(/.*?更新日時：(.*)\)/, "$1");
    return update_time;
  }

  function team_ranking(){
    return Array.from(game_frame().querySelectorAll('#mCSB_1_container > section > div'))
                .map(i=>{
                  const user_info = i.innerText
                                     .split('\n')
                                     .filter(x=>!x.match(/リーダー/))
                                     .map((x,i)=> {
                                       switch(i){
                                         case 0:  return x.replace(/([0-9]+位).*?([0-9,]+)pt/, "$1\t$2");
                                         case 1:  return x.padEnd(15);
                                         default: return x;
                                       }
                                     })
                                     .join('\t');
                  return user_info;
                });
  }

  function target_page_opened(page_num){
    return () => {
      const target_page_button = game_frame().querySelector(`#asyPager > ul > li > a.selected[data-paging="${page_num}"]`);
      return not_now_loading && target_page_button;
    };
  }

  function not_now_loading(){
    return Boolean(game_frame().querySelector('#now_loading[style*="display: none;"]'));
  }

  async function wait(predicate) {
    const wait_max_time = 10;
    const loop_sleep_time = 0.3;
    let elapsed_time = 0;

    while(elapsed_time < wait_max_time && !predicate()){
      await sleep(loop_sleep_time);
      elapsed_time += loop_sleep_time;
    }
    await sleep(sleep_sec);
  }

  function change_search_params(query_string){
    const frame_location = document.querySelector('#game_frame').contentWindow.location;
    const params = new URLSearchParams(query_string);
    const current_params = new URLSearchParams(frame_location.search);
    const thash = current_params.get("thash");
    const opensocial_owner_id = current_params.get("opensocial_owner_id");

    if ( thash && opensocial_owner_id ) {
      params.set("thash", thash);
      params.set("opensocial_owner_id", opensocial_owner_id);
    }

    frame_location.search = params;
  }

  function game_frame(){
    return document.querySelector('#game_frame').contentDocument;
  }

  function game_window(){
    return document.querySelector('#game_frame').contentWindow;
  }

  function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
  }

})();
