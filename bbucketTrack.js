/**
 * jQuery Bitbucket Viewer
 * 
 * @version 0.1.0
 * @author JSLirola <jslirola@andalucia-devs.com>
 */

(function( $ ) {
    "use strict";

    $.fn.bbRepositories = function(options) {
 
        var self = $(this);
        var settings = $.extend(true, {
            username: "jslirola",       // Account name of Bitbucket
            showDetails: false,         // Details of repository like description
            getCommits: {
                showTable: true,        // When the repo is clicked will be the table
                cssTable: "repoTable",  // Selector to show the events output
                dateFormat: "",
                maxRows: 10             // Between 0 and 50 events
            }
        }, options);

        $.getJSON( "https://api.bitbucket.org/2.0/repositories/" + settings.username, function( data ) {

            $.each( data["values"], function( key, val ) {
                var repo = jQuery.parseJSON(JSON.stringify(val));
                self.append("<li id='" + rKey(repo.uuid) + "'>" + repo.name + " </li>");
                if(settings.showDetails) {
                    self.append("<span data-uuid='" + rKey(repo.uuid) + "'>"+repo.description+"</span>");
                }
            });

            if(settings.getCommits.showTable) {
                self.children("li").wrapInner('<a href="javascript:;" />')            
                self.on('click', 'li', function() {
                    $('table[data-uuid]').hide();
                    getCommits("https://api.bitbucket.org/2.0/repositories/"+settings.username+"/"+aKey($(this).attr("id"))+"/commits",$(this).attr("id"));
                    $('table[data-uuid='+$(this).attr("id")+']').show();
                });
            }

        }).fail(function(jqXHR, textStatus, errorThrown) { alert('getJSON request failed! ' + jqXHR.responseText); });

        function getCommits(url, uuid) {
            if (!$('table[data-uuid='+uuid+']').length){ // If doesn't exists
                var $table = $('<table/>');
                $table.addClass(settings.getCommits.cssTable);
                $table.attr("data-uuid",uuid);
                $table.append( '<thead><tr><th> Date </th><th> Description </th><th> Username </th></tr></thead>' );
                $.getJSON( url, function( data ) {
                    $.each( data["values"], function( key, val ) {
                        if(key >= settings.getCommits.maxRows) return false; // Limit events
                        var event = jQuery.parseJSON(JSON.stringify(val));
                        $table.append(
                            '<tr>' +
                                '<td>' + formatDate(event.date) + '</td>' + 
                                '<td> <a href="' + event.links.html.href + '" target="_blank" title="View on Bitbucket">' + event.message + '</a> </td>' + 
                                '<td>' + event.author.user.username + '</td>' +
                            '</tr>' );
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) { alert('getJSON request failed! ' + textStatus); });
                $table.insertAfter(self);
            }
        }

        function formatDate(jDate) {
            var myNewDate = new Date(jDate);
            return (myNewDate.getDate() + "/" + (myNewDate.getMonth()+1) + "/" + myNewDate.getFullYear());

        };         

        function rKey(str) {
            return str.match(/\{(.*)\}/)[1];
        }

        function aKey(str) {
            return "%7B"+str+"%7D";
        }

    };
 
}( jQuery ));