(function ( $ ) {
    'use strict';

    var isTouch       = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints)),
        isMobile      = navigator.userAgent.match(
            /(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/
        ),
        get_url       = function ( endpoint ) {
            return biolife_params.biolife_ajax_url.toString().replace(
                '%%endpoint%%',
                endpoint
            );
        },
        get_cookie    = function ( name ) {

            var e, b, cookie = document.cookie, p = name + '=';

            if ( !cookie ) {
                return;
            }

            b = cookie.indexOf( '; ' + p );

            if ( b === -1 ) {
                b = cookie.indexOf( p );

                if ( b !== 0 ) {
                    return null;
                }
            } else {
                b += 2;
            }

            e = cookie.indexOf( ';', b );

            if ( e === -1 ) {
                e = cookie.length;
            }

            return decodeURIComponent( cookie.substring( b + p.length, e ) );

        },
        set_cookie    = function ( name, value, expires, path, domain, secure ) {

            var d = new Date();

            if ( typeof (expires) === 'object' && expires.toGMTString ) {
                expires = expires.toGMTString();
            } else if ( parseInt( expires, 10 ) ) {
                d.setTime( d.getTime() + (parseInt( expires, 10 ) * 1000) );
                expires = d.toGMTString();
            } else {
                expires = '';
            }

            document.cookie = name + '=' + encodeURIComponent( value ) +
                (expires ? '; expires=' + expires : '') +
                (path ? '; path=' + path : '') +
                (domain ? '; domain=' + domain : '') +
                (secure ? '; secure' : '');

        },
        remove_cookie = function ( name, path, domain, secure ) {
            set_cookie( name, '', -1000, path, domain, secure );
        };

    var is_webkit = navigator.userAgent.toLowerCase().indexOf( 'webkit' ) > -1,
        is_opera  = navigator.userAgent.toLowerCase().indexOf( 'opera' ) > -1,
        is_ie     = navigator.userAgent.toLowerCase().indexOf( 'msie' ) > -1;

    if ( (is_webkit || is_opera || is_ie) && document.getElementById && window.addEventListener ) {
        window.addEventListener( 'hashchange', function () {
            var element = document.getElementById( location.hash.substring( 1 ) );

            if ( element ) {
                if ( !/^(?:a|select|input|button|textarea)$/i.test( element.tagName ) ) {
                    element.tabIndex = -1;
                }

                element.focus();
            }
        }, false );
    }
    /* AJAX TABS */
    $( document ).on( 'click', '.ovic-tabs .tabs .tab-link, .ovic-accordion .panel-heading a', function ( e ) {
        e.preventDefault();
        var $this       = $( this ),
            $data       = $this.data(),
            $tabID      = $( $this.attr( 'href' ) ),
            $tabItem    = $this.closest( '.tab-item' ),
            $tabContent = $tabID.closest( '.tabs-container,.ovic-accordion' ),
            $loaded     = $this.closest( '.tabs,.ovic-accordion' ).find( 'a.loaded' ).attr( 'href' ),
            _tab_head = $this.closest( '.biolife-dropdown' );
        if (_tab_head.length >0){
            _tab_head.find('.dropdown-toggle').html($this.html());
        }
        if ( $data.ajax == 1 && !$this.hasClass( 'loaded' ) ) {
            $tabContent.addClass( 'loading' );
            $tabItem.addClass( 'active' ).closest( '.tabs' ).find( '.tab-item' ).not( $tabItem ).removeClass( 'active' );
            $.ajax( {
                type: 'POST',
                url: get_url( 'content_ajax_tabs' ),
                data: {
                    security: biolife_params.security,
                    section: $data.section,
                },
                success: function ( response ) {
                    $( '[href="' + $loaded + '"]' ).removeClass( 'loaded' );
                    if ( response ) {
                        $tabID.html( response );
                        if ( $tabID.find( '.lazy' ).length ) {
                            $tabID.find( '.lazy' ).lazy( { delay: 0 } );
                        }
                        if ( $tabID.find( '.owl-slick' ).length ) {
                            $tabID.find( '.owl-slick' ).biolife_init_carousel();
                        }
                        if ( $tabID.find( '.equal-container.better-height' ).length ) {
                            $tabID.find( '.equal-container.better-height' ).biolife_better_equal_elems();
                        }
                        if ( $tabID.find( '.biolife-countdown' ).length && $.fn.biolife_countdown ) {
                            $tabID.find( '.biolife-countdown' ).biolife_countdown();
                        }
                        if ( $tabID.find( '.ovic-products' ).length && $.fn.biolife_load_infinite ) {
                            $tabID.find( '.ovic-products' ).biolife_load_infinite();
                        }
                        if ( $tabID.find( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).length && isMobile === null ) {
                            $tabID.find( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).biolife_hover_product();
                        }
                        if ( $tabID.find( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).length ) {
                            $tabID.find( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).biolife_bootstrap_tooltip();
                        }
                    } else {
                        $tabID.html( '<div class="alert alert-warning">' + biolife_params.tab_warning + '</div>' );
                    }
                    /* for accordion */
                    $this.closest( '.panel-default' ).addClass( 'active' ).siblings().removeClass( 'active' );
                    $this.closest( '.ovic-accordion' ).find( $tabID ).slideDown( 400 );
                    $this.closest( '.ovic-accordion' ).find( '.panel-collapse' ).not( $tabID ).slideUp( 400 );
                },
                complete: function () {
                    $this.addClass( 'loaded' );
                    $tabContent.removeClass( 'loading' );
                    setTimeout( function ( $tabID, $tab_animated, $loaded ) {
                        $tabID.addClass( 'active' ).siblings().removeClass( 'active' );
                        $tabID.animation_tabs( $tab_animated );
                        $( $loaded ).html( '' );
                        $( document).trigger( 'biolife_tabs_loaded', [$this]);
                    }, 10, $tabID, $data.animate, $loaded );
                },
                ajaxError: function () {
                    $tabContent.removeClass( 'loading' );
                    $tabID.html( '<div class="alert alert-warning">' + biolife_params.tab_warning + '</div>' );
                }
            } );
        } else {
            $tabItem.addClass( 'active' ).closest( '.tabs' ).find( '.tab-item' ).not( $tabItem ).removeClass( 'active' );
            $tabID.addClass( 'active' ).siblings().removeClass( 'active' );
            /* for accordion */
            $this.closest( '.panel-default' ).addClass( 'active' ).siblings().removeClass( 'active' );
            $this.closest( '.ovic-accordion' ).find( $tabID ).slideDown( 400 );
            $this.closest( '.ovic-accordion' ).find( '.panel-collapse' ).not( $tabID ).slideUp( 400 );
            /* for animate */
            $tabID.animation_tabs( $data.animate );
            if ( $tabID.find( '.lazy' ).length ) {
                $tabID.find( '.lazy' ).biolife_init_lazy_load();
            }
            $( document).trigger( 'biolife_tabs_loaded', [$this]);
        }

    } );

    /* ANIMATE */
    $.fn.animation_tabs             = function ( $tab_animated ) {
        $tab_animated = ($tab_animated === undefined || $tab_animated === '') ? '' : $tab_animated;
        if ( $tab_animated !== '' ) {
            $( this ).find( '.owl-slick .slick-active, .product-list-grid .product-item' ).each( function ( i ) {
                var $this  = $( this ),
                    $style = $this.attr( 'style' ),
                    $delay = i * 200;

                $style = ($style === undefined) ? '' : $style;
                $this.attr( 'style', $style +
                    ';-webkit-animation-delay:' + $delay + 'ms;' +
                    '-moz-animation-delay:' + $delay + 'ms;' +
                    '-o-animation-delay:' + $delay + 'ms;' +
                    'animation-delay:' + $delay + 'ms;'
                ).addClass( $tab_animated + ' animated' ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                    $this.removeClass( $tab_animated + ' animated' );
                    $this.attr( 'style', $style );
                } );
            } );
        }
    };
    $.fn.biolife_init_carousel      = function () {
        $( this ).not( '.slick-initialized' ).each( function () {
            var $this   = $( this ),
                $config = $this.data( 'slick' ) !== undefined ? $this.data( 'slick' ) : [],
                owl_nav_custom      = $this.data( 'owl_nav_custom' ),
                owl_next_el        = $this.data( 'owl_next_el' ),
                owl_prev_el        = $this.data( 'owl_prev_el' );

            if ( $this.hasClass( 'flex-control-thumbs' ) ) {
                $config = biolife_params.product_thumbnail;
            }
            if ( $this.hasClass( 'elementor-section-slide' ) ) {
                $this = $this.find( '.elementor-row' );
                if ( $this.hasClass( 'slick-initialized' ) ) {
                    return false;
                }
            }
            if ( $config.length <= 0 ) {
                return false;
            }
            if ($('body').hasClass('rtl')){
                $config.rtl = true;
            }
            if ( owl_nav_custom == 'yes' && owl_next_el != undefined && owl_prev_el != undefined  ) {
                if ( $( "." + owl_next_el ).length && $( "." + owl_prev_el ).length ) {
                    if ( $this.closest( '.ovic-menu-clone-wrap' ).length > 0 ) {
                        $config.prevArrow = $( ".ovic-menu-clone-wrap ." + owl_prev_el );
                        $config.nextArrow = $( ".ovic-menu-clone-wrap ." + owl_next_el );
                    } else {
                        $config.prevArrow = $( "." + owl_prev_el );
                        $config.nextArrow = $( "." + owl_next_el );
                    }
                } else {
                    if ( $config.vertical == true ) {
                        $config.prevArrow = '<span class="fa fa-angle-up prev"></span>';
                        $config.nextArrow = '<span class="fa fa-angle-down next"></span>';
                    } else {
                        $config.prevArrow = '<span class="fa fa-angle-left prev"></span>';
                        $config.nextArrow = '<span class="fa fa-angle-right next"></span>';
                    }
                }
            }else{
                if ( $config.vertical == true ) {
                    $config.prevArrow = '<span class="fa fa-angle-up prev"></span>';
                    $config.nextArrow = '<span class="fa fa-angle-down next"></span>';
                } else {
                    $config.prevArrow = '<span class="fa fa-angle-left prev"></span>';
                    $config.nextArrow = '<span class="fa fa-angle-right next"></span>';
                }
            }
            $config.customPaging = function ( slick, index ) {
                return '<span class="number">' + (index + 1) + '</span><button type="button">' + (index + 1) + '</button>';
            };
            $this.on( 'init', function ( event, slick ) {
                $( event.target ).trigger( 'biolife_trigger_init_slide', slick );
            } );

                $this.slick( $config );

            $this.on( 'beforeChange', function ( event, slick, currentSlide, nextSlide ) {
                $( slick.$list ).trigger( 'biolife_trigger_before_change_slide', slick, currentSlide, nextSlide );
            } );
            $this.on( 'afterChange', function ( event, slick, currentSlide, nextSlide ) {
                $( slick.$list ).find( '.lazy' ).biolife_init_lazy_load();
                $( slick.$list ).trigger( 'biolife_trigger_after_change_slide', slick, currentSlide, nextSlide );
            } );
            $this.on( 'setPosition', function ( event ) {
                $( event.target ).trigger( 'biolife_trigger_setPosition_slide' );
                if ( $( event.target ).find( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).length && isMobile === null ) {
                    $( event.target ).find( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).biolife_hover_product();
                }
            } );
        } );
    };
    $.fn.biolife_init_lazy_load     = function () {
        $( this ).each( function () {
            var $this   = $( this ),
                $config = [];

            $config.beforeLoad     = function ( element ) {
                if ( element.is( 'div' ) === true ) {
                    element.addClass( 'loading-lazy' );
                } else {
                    element.parent().addClass( 'loading-lazy' );
                }
            };
            $config.afterLoad      = function ( element ) {
                if ( element.is( 'div' ) === true ) {
                    element.removeClass( 'loading-lazy' );
                } else {
                    element.parent().removeClass( 'loading-lazy' );
                }
            };
            $config.onFinishedAll  = function () {
                if ( !this.config( 'autoDestroy' ) )
                    this.destroy();
            }
            $config.effect         = "fadeIn";
            $config.enableThrottle = true;
            $config.throttle       = 250;
            $config.effectTime     = 600;
            if ( $this.closest( '.ovic-menu-clone-wrap' ).find( '.ovic-menu-panel' ).length ) {
                $config.appendScroll = $this.closest( '.ovic-menu-clone-wrap' ).find( '.ovic-menu-panel' );
            }
            $this.lazy( $config );
        } );
    };
    $.fn.biolife_better_equal_elems = function () {
        var $this = $( this );
        $this.on( 'biolife_better_equal_elems', function () {
            setTimeout( function () {
                $this.each( function () {
                    if ( $( this ).find( '.equal-elem' ).length ) {
                        $( this ).find( '.equal-elem' ).css( {
                            'height': 'auto'
                        } );
                        var $height = 0;
                        $( this ).find( '.equal-elem' ).each( function () {
                            if ( $height < $( this ).height() ) {
                                $height = $( this ).height();
                            }
                        } );
                        $( this ).find( '.equal-elem' ).height( $height );
                    }
                } );
            }, 100 );
        } ).trigger( 'biolife_better_equal_elems' );
        $( window ).on( 'resize', function () {
            $this.trigger( 'biolife_better_equal_elems' );
        } );
    };
    $.fn.biolife_sticky_header      = function () {
        $( this ).each( function () {
            var $this          = $( this ),
                $header_height = $( '.header' ).height();

            $( document ).on( 'scroll', function ( event ) {
                var st = $( this ).scrollTop();
                if ( st > $header_height + 60 ) {
                    $this.addClass( 'is-sticky' );
                } else {
                    $this.removeClass( 'is-sticky' );
                    $this.find( '.biolife-dropdown' ).removeClass( 'open' );
                }
            } );
        } );
    };
    $.fn.biolife_product_tab_style2      = function () {
        //if (isMobile === null){
            var $this = $( this ),
                _tabs = $this.find('.ovic-tabs--head-tabs'),
                _index = _tabs.find('.tab-item.active').index();
            $this.find('.product--style-12').each(function (){
                $(this).find('.product--inner-prices > *').removeClass('active');
                let _price_active = $(this).find('.product--inner-prices').children().eq(_index);
                if (_price_active !== undefined){
                    _price_active.addClass('active');
                }
            })
        //}

    };
    /* HOVER PRODUCT */
    $.fn.biolife_hover_product = function () {
        $( this ).each( function () {
            var $this = $( this ),
                $list = $this.closest( '.slick-list' );
            if ( $this.closest( '.owl-slick' ).length && $( window ).width() > 1199 ) {
                $this.hover(
                    function ( e ) {
                        $list.css( {
                            'padding': '10px 10px 200px',
                            'margin': '-10px -10px -200px',
                            'z-index': '4',
                        } );
                    }, function () {
                        $list.css( {
                            'padding': '0',
                            'margin': '0',
                            'z-index': '1',
                        } );
                    }
                );
            }
        } );
    };
    /* DROPDOWN */
    $( document ).on( 'click', function ( event ) {

        var $target  = $( event.target ).closest( '.biolife-dropdown' ),
            $current = $target.closest( '.biolife-parent-toggle' ),
            $parent  = $( '.biolife-dropdown' );
        if ( $target.length ) {
            $parent.not( $target ).not( $current ).removeClass( 'open' );
            if ( $( event.target ).is( '[data-biolife="biolife-dropdown"]' ) ||
                $( event.target ).closest( '[data-biolife="biolife-dropdown"]' ).length ) {
                if ( $target.hasClass( 'open' ) ) {
                    if ( $target.hasClass( 'overlay' ) ) {
                        $( 'body' ).removeClass( 'active-overlay' );
                    }
                } else {
                    if ( $target.hasClass( 'overlay' ) ) {
                        $( 'body' ).addClass( 'active-overlay' );
                    }
                    if ($target.hasClass( 'block-search-wrap' )){
                        $target.find('.dgwt-wcas-search-input').focus();
                    }
                }
                $target.toggleClass( 'open' );
                event.preventDefault();
            }
        } else {
            $( '.biolife-dropdown' ).removeClass( 'open' );
            if ( $target.hasClass( 'overlay' ) || !$target.length ) {
                $( 'body' ).removeClass( 'active-overlay' );
            }
            if ($( event.target ).hasClass('js-open-search')){
                event.preventDefault();
                $( 'body' ).toggleClass('search-opened');
            }else{
                $( 'body' ).removeClass('search-opened');
            }
        }
    } );
    /* POPUP VIDEO */
    $( document ).on( 'click', '.popup-video', function ( e ) {
        var $this   = $( this ),
            $href   = $this.attr( 'href' ),
            $effect = $this.attr( 'data-effect' );

        if ( $.fn.magnificPopup ) {
            $.magnificPopup.open( {
                items: {
                    src: $href,
                },
                type: 'iframe', // this is a default type
                iframe: {
                    markup: '<div class="mfp-iframe-scaler mfp-with-anim">' +
                        '<div class="mfp-close"></div>' +
                        '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
                        '</div>',
                },
                callbacks: {
                    beforeOpen: function () {
                        this.st.mainClass = $effect;
                    },
                },
                removalDelay: 500,
                midClick: true
            } );
            e.preventDefault();
        }
    } );
    /* LOOP GALLERY IMAGE */
    $( document ).on( 'click', '.product-item .product-loop-gallery a', function ( event ) {
        var $this     = $( this ),
            $img      = $this.attr( 'data-image' ),
            $index    = $this.attr( 'data-index' ),
            $parent   = $this.closest( '.product-item' ),
            $slide    = $parent.find( '.thumb-wrapper' ),
            $main_img = $parent.find( '.wp-post-image' );

        if ( $main_img ) {
            if ( $this.hasClass( 'dot-item' ) && $slide.length ) {
                $slide.slick( 'slickGoTo', $index );
            } else {
                //$main_img.parent().addClass('loading-lazy');
                $main_img.attr( 'src', $img ).attr( 'srcset', $img );
                $main_img.css( {
                    '-webkit-transform': 'scale(0.5)',
                    '-moz-transform': 'scale(0.5)',
                    '-ms-transform': 'scale(0.5)',
                    '-o-transform': 'scale(0.5)',
                    'transform': 'scale(0.5)',
                    'opacity': '0',
                    '-webkit-transition': 'all 0.3s ease',
                    '-moz-transition': 'all 0.3s ease',
                    '-ms-transition': 'all 0.3s ease',
                    '-o-transition': 'all 0.3s ease',
                    'transition': 'all 0.3s ease',
                } ).load( function () {
                    var image = $( this );
                    setTimeout( function () {
                        image.css( {
                            '-webkit-transform': 'scale(1)',
                            '-moz-transform': 'scale(1)',
                            '-ms-transform': 'scale(1)',
                            '-o-transform': 'scale(1)',
                            'transform': 'scale(1)',
                            'opacity': '1',
                            '-webkit-transition': 'all 0.3s ease',
                            '-moz-transition': 'all 0.3s ease',
                            '-ms-transition': 'all 0.3s ease',
                            '-o-transition': 'all 0.3s ease',
                            'transition': 'all 0.3s ease',
                        } );
                        //image.parent().removeClass('loading-lazy');
                    }, 300 );
                } );
            }
            $( this ).addClass( 'gallery-active' ).siblings().removeClass( 'gallery-active' );
        }

        event.preventDefault();
    } );
    /* BUTTON TOOLTIP */
    $.fn.biolife_bootstrap_tooltip = function () {
        if ( $.fn.ovic_add_notify ) {
            $( this ).each( function () {
                var $this      = $( this ),
                    $product   = $this.closest( '.product-item' ),
                    $text      = $this.text();

                if ( $product.length ) {
                    if (
                        $product.hasClass( 'list' ) ||
                        $product.hasClass( 'style-02' ) ||
                        $product.hasClass( 'style-03' ) ||
                        $product.hasClass( 'style-05' ) ||
                        $product.hasClass( 'style-10' ) ||
                        $product.hasClass( 'style-14' )
                    ) {
                        $this.tooltip( {
                            trigger: 'hover',
                            placement: 'top',
                            container: 'body',
                            title: $text,
                        } );
                    }
                    if (
                        $product.hasClass( 'style-12' ) ||
                        $product.hasClass( 'style-13' ) ||
                        $product.hasClass( 'style-15' ) ||
                        $product.hasClass( 'style-19' ) ||
                        $product.hasClass( 'style-18' ) ||
                        $product.hasClass( 'style-20' ) ||
                        $product.hasClass( 'style-21' ) ||
                        $product.hasClass( 'style-22' ) ||
                        $product.hasClass( 'style-24' )
                    ) {
                        $this.tooltip( {
                            trigger: 'hover',
                            placement: 'left',
                            container: 'body',
                            title: $text,
                        } );
                    }
                }
            } );
        }
    }
    /* ZOOM IMAGE */
    $.fn.biolife_zoom_product = function () {
        if ( $( this ).find( '.inner.zoom' ).length && $.fn.zoom ) {
            $( this ).find( '.inner.zoom' ).each( function () {
                var zoomTarget = $( this ),
                    zoomImg    = zoomTarget.data( 'image' );

                zoomTarget.zoom( {
                    url: zoomImg,
                    touch: false,
                    magnify: 1.2,
                } );
            } );
        }
    };
    /* TOGGLE WIDGET */
    $.fn.ovic_category_product = function () {
        $( this ).each( function () {
            var $main = $( this );
            $main.find( '.cat-parent' ).each( function () {
                if ( $( this ).hasClass( 'current-cat-parent' ) ) {
                    $( this ).addClass( 'show-sub' );
                    $( this ).children( '.children' ).slideDown( 400 );
                }
                $( this ).children( '.children' ).before( '<span class="carets"></span>' );
            } );
            $main.children( '.cat-parent' ).each( function () {
                var curent = $( this ).find( '.children' );
                $( this ).children( '.carets' ).on( 'click', function () {
                    $( this ).parent().toggleClass( 'show-sub' );
                    $( this ).parent().children( '.children' ).slideToggle( 400 );
                    $main.find( '.children' ).not( curent ).slideUp( 400 );
                    $main.find( '.cat-parent' ).not( $( this ).parent() ).removeClass( 'show-sub' );
                } );
                var next_curent = $( this ).find( '.children' );
                next_curent.children( '.cat-parent' ).each( function () {
                    var child_curent = $( this ).find( '.children' );
                    $( this ).children( '.carets' ).on( 'click', function () {
                        $( this ).parent().toggleClass( 'show-sub' );
                        $( this ).parent().parent().find( '.cat-parent' ).not( $( this ).parent() ).removeClass( 'show-sub' );
                        $( this ).parent().parent().find( '.children' ).not( child_curent ).slideUp( 400 );
                        $( this ).parent().children( '.children' ).slideToggle( 400 );
                    } )
                } );
            } );
        } );
    };
    /* QUANTITY */
    if ( !String.prototype.getDecimals ) {
        String.prototype.getDecimals = function () {
            var num   = this,
                match = ('' + num).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
            if ( !match ) {
                return 0;
            }
            return Math.max( 0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0) );
        };
    }
    $( document ).on( 'click', '.quantity-plus, .quantity-minus', function ( e ) {
        e.preventDefault();
        // Get values
        var $qty       = $( this ).closest( '.quantity' ).find( '.qty' ),
            currentVal = parseFloat( $qty.val() ),
            max        = parseFloat( $qty.attr( 'max' ) ),
            min        = parseFloat( $qty.attr( 'min' ) ),
            step       = $qty.attr( 'step' );

        if ( !$qty.is( ':disabled' ) ) {
            // Format values
            if ( !currentVal || currentVal === '' || currentVal === 'NaN' ) currentVal = 0;
            if ( max === '' || max === 'NaN' ) max = '';
            if ( min === '' || min === 'NaN' ) min = 0;
            if ( step === 'any' || step === '' || step === undefined || parseFloat( step ) === 'NaN' ) step = '1';

            // Change the value
            if ( $( this ).is( '.quantity-plus' ) ) {
                if ( max && (currentVal >= max) ) {
                    $qty.val( max );
                } else {
                    $qty.val( (currentVal + parseFloat( step )).toFixed( step.getDecimals() ) );
                }
            } else {
                if ( min && (currentVal <= min) ) {
                    $qty.val( min );
                } else if ( currentVal > 0 ) {
                    $qty.val( (currentVal - parseFloat( step )).toFixed( step.getDecimals() ) );
                }
            }

            // Trigger change event
            $qty.trigger( 'change' );
        }
    } ).on( 'found_variation', function( ev, variation ){
        console.log(variation);
    });
    /* UPDATE COUNT WISHLIST */
    $( document ).on( 'added_to_wishlist removed_from_wishlist', function () {
        $.get( get_url( 'update_wishlist_count' ), function ( count ) {
            if ( !count ) {
                count = 0;
            }
            $( '.block-wishlist .count' ).text( count );
        } );
    } );

    $( document ).on( 'click', '.backtotop, .action-to-top', function ( e ) {
        $( 'html, body' ).animate( { scrollTop: 0 }, 800 );
        e.preventDefault();
    } );

    if ( biolife_params.ajax_comment == 1 ) {
        $( document ).on( 'click', '#comments .woocommerce-pagination a', function () {
            var $this        = $( this ),
                $comment     = $this.closest( '#comments' ),
                $commentlist = $comment.find( '.commentlist' ),
                $pagination  = $this.closest( '.woocommerce-pagination' );

            $comment.addClass( 'loading' );
            $.ajax( {
                url: $this.attr( 'href' ),
                success: function ( response ) {
                    if ( !response ) {
                        return;
                    }
                    var $html    = $.parseHTML( response, document, true ),
                        $nav     = $( '#comments .woocommerce-pagination', $html ).length ? $( '#comments .woocommerce-pagination', $html )[0].innerHTML : '',
                        $content = $( '#comments .commentlist', $html ).length ? $( '#comments .commentlist', $html )[0].innerHTML : '';

                    if ( $content !== '' ) {
                        $commentlist.html( $content );
                    }
                    $pagination.html( $nav );
                    $comment.removeClass( 'loading' );
                },
            } );

            return false;
        } );
    }

    // $( document ).on( 'click', '.header-sticky .box-nav-vertical .block-title, .header .box-nav-vertical:not(.always-open) .block-title, body:not(.page-template-fullwidth) .header .box-nav-vertical .block-title', function ( e ) {
    //     $( this ).closest( '.box-nav-vertical' ).toggleClass( 'open' );
    //     e.preventDefault();
    // } );

    $( document ).on( 'click', '.overlay-body', function ( e ) {
        $( 'body' ).removeClass( 'ovic-open-mobile-menu sidebar-opened' );
        $( '.ovic-menu-clone-wrap' ).removeClass( 'open' );
        e.preventDefault();
    } );
    $( document ).on( 'click', '.sidebar-toggle', function ( e ) {
        $( 'body' ).addClass( 'ovic-open-mobile-menu sidebar-opened' );
        e.preventDefault();
    } );
    $( document ).on( 'click', '.mobile-toggle', function ( e ) {
        $(this).closest('.fixed').toggleClass('open');
        e.preventDefault();
    } );

    $( document ).on( 'click', '.post-meta .share-post .toggle', function () {
        $( this ).closest( '.share-post' ).toggleClass( 'open' );
        return false;
    } );
    $( document ).on( 'click', '.localization_menu>.menu-item>a', function ( e ) {
        $(this).closest('.localization_menu').toggleClass('open');
        e.preventDefault();
        return false;
    } );
    $( document ).on( 'change', '#biolife_disabled_popup_by_user', function () {
        if ( $( this ).is( ":checked" ) ) {
            set_cookie( 'biolife_disabled_popup_by_user', 'true' );
        } else {
            set_cookie( 'biolife_disabled_popup_by_user', '' );
        }
    } );

    $( document ).ajaxComplete( function ( event, xhr ) {
        if ( xhr.status == 200 && xhr.responseText ) {
            if ( $( event.target ).find( '.lazy' ).length ) {
                $( event.target ).find( '.lazy' ).biolife_init_lazy_load();
            }
        }
    } );

    $( document ).on( 'wc-product-gallery-after-init', function ( event, target ) {
        if ( $( target ).find( '.flex-control-thumbs' ).length ) {
            $( target ).find( '.flex-control-thumbs' ).biolife_init_carousel();
        }
    } );

    $( document ).on( 'ovic_success_load_more_post', function ( event, content ) {
        if ( $.fn.biolife_bootstrap_tooltip && $( event.target ).find( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).length ) {
            $( event.target ).find( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).biolife_bootstrap_tooltip();
        }
        if ( $( event.target ).find( '.lazy' ).length ) {
            $( event.target ).find( '.lazy' ).lazy( { delay: 0 } );
        }
        if ( $( event.target ).find( '.owl-slick' ).length ) {
            $( event.target ).find( '.owl-slick' ).biolife_init_carousel();
        }
        if ( $( '.equal-container.better-height' ).length ) {
            $( '.equal-container.better-height' ).biolife_better_equal_elems();
        }
    } );
    $( document ).on( "mouseenter", '.js-style-hover:not(.active)', function ( e ) {
        let _this      = $( this ),
            _hover_css = _this.data( 'hover_css' );
        if ( _hover_css ) {
            _this.css( _hover_css );
        }
    } ).on( 'mouseleave', '.js-style-hover:not(.active)', function () {
        let _this = $( this ),
            _css  = _this.data( 'css' );
        _this.attr( 'style', _css );
    } );
    $( window ).on( 'scroll', function () {
        if ( $( window ).scrollTop() > 400 ) {
            $( '.backtotop' ).addClass( 'show' );
        } else {
            $( '.backtotop' ).removeClass( 'show' );
        }
    } );
    $( document).on( 'biolife_tabs_loaded', function(e, el) {
        let _ovic_tabs = el.closest( '.ovic-tabs');
        if (_ovic_tabs.hasClass('ovic-tabs-style-02')){
            _ovic_tabs.biolife_product_tab_style2();
        }
    });
    $( window ).on( 'updated_wc_div', function ( event ) {
        if ( $( event.target ).find( '.cross-sells .owl-slick' ).length > 0 ) {
            $( event.target ).find( '.cross-sells .owl-slick' ).biolife_init_carousel();
        }
    } );

    $( window ).on( 'wc_fragments_loaded', function () {
        if ( $( '.woocommerce-mini-cart' ).length && isMobile === null && $.fn.scrollbar ) {
            $( '.woocommerce-mini-cart' ).scrollbar();
        }
    } );

    $( window ).ready( function () {
    } );

    window.addEventListener( "load", function load() {
        /**
         * remove listener, no longer needed
         * */
        window.removeEventListener( "load", load, false );
        /**
         * start functions
         * */
        if ( $( '.owl-slick' ).length ) {
                $( '.owl-slick' ).biolife_init_carousel();

        }
        if ( $( '.elementor-section-slide' ).length ) {
            $( '.elementor-section-slide' ).biolife_init_carousel();
        }
        if ( $( '.equal-container.better-height' ).length ) {
            $( '.equal-container.better-height' ).biolife_better_equal_elems();
        }
        if ( $( '.lazy' ).length ) {
            $( '.lazy' ).biolife_init_lazy_load();
        }
        if ( $( '.ovic-banner' ).length ) {
            $( '.ovic-banner' ).biolife_zoom_product();
        }
        if ( $( '.shop-before-control select' ).length ) {
            $( '.shop-before-control select' ).chosen( { disable_search_threshold: 10 } );
        }
        if ( $( '.widget_product_categories .product-categories' ).length ) {
            $( '.widget_product_categories .product-categories' ).ovic_category_product();
        }
        if ( $( '.category-search-option' ).length ) {
            $( '.category-search-option' ).chosen();
        }
        if ( $( '.ovic-tabs .dropdown-toggle' ).length ) {
            $( '.ovic-tabs .dropdown-toggle' ).each(function (){
                var _this = $(this),
                    _tab_head = _this.closest( '.biolife-dropdown' );
                if (_tab_head.length >0){
                    _this.html(_tab_head.find('.ovic-tab--title.active > .ovic-tab--link').html());
                }
            });


            $( '.category-search-option' ).chosen();
        }
        if ( $( '.biolife-popup-newsletter' ).length && get_cookie( 'biolife_disabled_popup_by_user' ) !== 'true' && $.fn.magnificPopup ) {
            var popup  = document.getElementById( 'biolife-popup-newsletter' ),
                effect = popup.getAttribute( 'data-effect' ),
                delay  = popup.getAttribute( 'data-delay' );

            setTimeout( function () {
                $.magnificPopup.open( {
                    items: {
                        src: '#biolife-popup-newsletter'
                    },
                    type: 'inline',
                    removalDelay: 600,
                    callbacks: {
                        beforeOpen: function () {
                            this.st.mainClass = effect;
                        }
                    },
                    midClick: true
                } );
            }, delay );
        }
        if ( $( '.ovic-tabs-style-02 .ovic-products.style-12' ).length ) {
            $( '.ovic-tabs-style-02' ).each(function (){
                $(this).biolife_product_tab_style2();
            });
        }
        /**
         * check not mobile
         * */
        if ( isMobile === null ) {
            if ( $( '.header-sticky' ).length && $( window ).width() > 1024 ) {
                $( '.header-sticky' ).biolife_sticky_header();
            }
            if ( $( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).length ) {
                $( '.product--style-01,.product--style-05,.product--style-09,.product--style-11,.product--style-13,.product--style-17,.product--style-26,.product--style-27,.product--style-29,.product--style-30' ).biolife_hover_product();
            }
            if ( $( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).length ) {
                $( '.yith-wcqv-button,.compare-button a.compare,.yith-wcwl-add-to-wishlist a' ).biolife_bootstrap_tooltip();
            }
            /* SCROLLBAR */
            if ( $.fn.scrollbar ) {
                if ( $( '.dokan-store-widget #cat-drop-stack > ul' ).length ) {
                    $( '.dokan-store-widget #cat-drop-stack > ul' ).scrollbar();
                }
            }


            if ( $( ".elementor-widget-ovic_products.image-style-right .ovic-products--image").length > 0 ) {
                if ($('body').hasClass('rtl')){
                    $( ".elementor-widget-ovic_products.image-style-right .ovic-products--image").each( function () {
                        var _parent = $( this ).parent(),
                            _right  = $( document ).width() - (_parent.offset().left + _parent.width());
                        if ( parseInt( _parent.offset().left, 10 ) > 0 ) {
                            $( this ).css( 'left', -(_parent.offset().left)  );
                        } else {
                            $( this ).css( 'left', 0 );
                        }
                    } );
                }else{
                    $( ".elementor-widget-ovic_products.image-style-right .ovic-products--image").each( function () {
                        var _parent = $( this ).parent(),
                            _right  = $( document ).width() - (_parent.offset().left + _parent.width());
                        if ( parseInt( _right, 10 ) > 0 ) {
                            $( this ).css( 'right', -_right );
                        } else {
                            $( this ).css( 'right', 0 );
                        }

                    } );
                }

            }





        }
    }, false );

    //
    // Elementor scripts
    //
    $( window ).on( 'elementor/frontend/init', function () {
        elementorFrontend.hooks.addAction( 'frontend/element_ready/global', function ( $scope, $ ) {
            $scope.find( '.lazy' ).biolife_init_lazy_load();
            /*$scope.find( '.owl-slick' ).each(function (){
                if ($(this).hasClass('elementor-widget-wrap')){
                    //$(this).biolife_init_carousel();
                    setTimeout(function(){$(this).biolife_init_carousel();}, 100);
                }else{
                    $(this).biolife_init_carousel();
                }
            });*/
            $scope.find( '.owl-slick' ).biolife_init_carousel();
            $scope.find( '.elementor-section-slide' ).biolife_init_carousel();
            $scope.find( '.equal-container.better-height' ).biolife_better_equal_elems();
        } );
    } );

})( window.jQuery );