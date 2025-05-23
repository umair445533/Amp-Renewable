(function($) {	

	jQuery.event.special.touchstart = {
        setup: function( _, ns, handle ) {
            this.addEventListener("touchstart", handle, { passive: !ns.includes("noPreventDefault") });
        }
    };
    jQuery.event.special.touchmove = {
        setup: function( _, ns, handle ) {
            this.addEventListener("touchmove", handle, { passive: !ns.includes("noPreventDefault") });
        }
    };
	jQuery.event.special.touchend = {
        setup: function( _, ns, handle ) {
            this.addEventListener("touchend", handle, { passive: !ns.includes("noPreventDefault") });
        }
    };

let barPercentage,
	euroLeft,
	carouselItems = 0,
	carouselIndex = 0,
	whereTouchStart = 0,
	offsetPosition = 0,
	posInitial = 0,
	posFinal,
	threshold = 45;

const modalNoticesTimeout = parseInt( $('.wc-timeline-inner-container').attr('data-notice-timeout') ) * 1000

function openModalCart()
{
	
	$('.wc-j-upsellator-show-cart').addClass('opened');
	$('.wc-timeline-button-show-cart').addClass('opened');
	$('.wc-timeline-modal-cover').addClass('opened');
	$('.wc-timeline-modal-cover-container').addClass('opened');
	
	$('body').addClass('woo-upsellator-modal-active');
	
	setTimeout( () => $('.wc-timeline-notifications').fadeOut( 500 ), modalNoticesTimeout )
	
	window.setTimeout( () => {

		$(document).bind( "mouseup touchend", function(e){

			const container = $('.wc-timeline-modal-cover-container');  

			if (!container.is(e.target)&& container.has(e.target).length === 0)	
			{								
				closeModalCart();				
			}
		});

	}, 500);

}

function closeModalCart()
{

		$('.wc-j-upsellator-show-cart').removeClass('opened');
		$('.wc-timeline-button-show-cart').removeClass('opened');
		$('.wc-timeline-modal-cover-container').removeClass('opened');
		$('.wc-timeline-modal-cover').removeClass('opened');

		$('.wc-timeline-cart-notice').fadeOut( 1 )
		
		$('body').removeClass('woo-upsellator-modal-active');
		$(document).unbind('mouseup touchend');		
}

function refreshCheckoutPage()
{
	// If the checkout is also displayed on this page, trigger update event.
	if ( $( '.woocommerce-checkout' ).length ) {
		$( document.body ).trigger( 'update_checkout' );
		$('.wc-timeline-checkout-upsell').remove();
	}	
}

function shiftCarouselTo( index, max )
{	
	
	if( index > max ) index = max
	if( index < 0 )   index = 0

	let carouselWidth = $('.wc-j-items-carousel-inner').width()
	posInitial		  = index * carouselWidth	

	$('.wc-j-items-carousel-inner').css({transform: "translate3d( -"+( posInitial )+"px, 0, 0)"});

	$('.wc-j-bullet').removeClass('active')
	$('.wc-j-bullet[data-index="' + index + '"]').addClass('active')

	if( index == 0 ) $('.wc-nav-prev').css('opacity', 0 )
	else 			 $('.wc-nav-prev').css('opacity', 1 )

	if( index == max ) $('.wc-nav-next').css('opacity', 0 )
	else 			   $('.wc-nav-next').css('opacity', 1 )
}

function preSetCarousel()
{

	if( $(".wc-j-items-carousel").length  )
	{	
			carouselIndex 		= 0
			carouselItems   	= $('.wc-j-bullet').length - 1
			whereTouchStart		= 0	
			posInitial			= 0
			posFinal			= 0
			offsetPosition		= 0
	}
}

function reloadShippingBar()
{
	
	if( $(".wcjfw-shipping-bar").length  )
	{	
			const currentValue 		= parseFloat( $('#wcjfw-cart-total').val() ) || 0;
			const oldGoal 			= parseInt( $(".wcjfw-shipping-bar").attr('data-current')	)		
			let current 			= 0;
			let higher_limit 		= 0;
			let lower_limit 		= 0;

			for( a = 1; a <= wc_timeline.goals_count; a++ )
			{
				let limit = parseFloat( $(".wcjfw-shipping-bar").attr('data-goal-limit-' + a ) );
				
				if( currentValue < limit )
				{
					higher_limit 	= limit;
					current 		= a - 1;
					break

				} else {

					lower_limit 		= limit;
					current 			= a;
					
				}

			}		
			
			$(".wcjfw-shipping-bar").attr('data-current', current )

			if( current == wc_timeline.goals_count )
			{
				$('.wcjfw-shipping-bar').progressBar( 101, euroLeft, current );
				return
			}	
			
			higher_limit 	= higher_limit == 0 ? lower_limit : higher_limit
			const range 	= higher_limit - lower_limit
			const delta    	= (  currentValue - lower_limit ) == 0 ? 0.001 : currentValue - lower_limit
		
			if( currentValue ) 
					barPercentage	=  ( delta * 100  ) / ( range + 0.001 );
			else
					barPercentage = 0;
				
			euroLeft 						= range - delta;

			if( oldGoal == wc_timeline.goals_count && current == wc_timeline.goals_count -1 )
			{
				$('.wcjfw-shipping-bar').progressBar( barPercentage, euroLeft, current );
				return
			}

			if( oldGoal < current )
			{
				
				$('.wcjfw-shipping-bar').progressBar( 99.99, euroLeft, oldGoal );

				setTimeout( () =>{
					$('.shipping-progress-bar').removeClass('transition')
					$('.wcjfw-shipping-bar').progressBar( 0.1, euroLeft, current )
				} , 600 )		
				
				setTimeout( () =>{
					$('.shipping-progress-bar').addClass('transition')
					$('.wcjfw-shipping-bar').progressBar( barPercentage, euroLeft, current )
				} , 700 )
				
				return

			}

			if( oldGoal > current && currentValue )
			{
				$('.wcjfw-shipping-bar').progressBar( 0.1, euroLeft, oldGoal );

				setTimeout( () =>{
					$('.shipping-progress-bar').removeClass('transition')
					$('.wcjfw-shipping-bar').progressBar( 99.99, euroLeft, current )
				} , 600 )		
				
				setTimeout( () =>{
					$('.shipping-progress-bar').addClass('transition')
					$('.wcjfw-shipping-bar').progressBar( barPercentage, euroLeft, current )
				} , 700 )

				return
			}			
				
			$('.wcjfw-shipping-bar').progressBar( barPercentage, euroLeft, current );
				
	}
}	
//Adjust the elementor cart item counter
function adjustElementor()
{
	const currentCount = parseInt( $('.wc-item-count').text() );

	if( $(".elementor-menu-cart__toggle").length && $('.wc-item-count').length )
	{
		const currentCount = parseInt( $('.wc-item-count').text() );
		$(".elementor-menu-cart__toggle").find(".elementor-button-icon").attr("data-counter", currentCount );
	}

}

$(document).ready(function() 
{

	$(document).on('click touch','.wc-j-upsellator-show-cart', function(){
		
		if( !$('.wc-timeline-modal-cover-container').length )
		{
			window.location.href = wc_timeline.cart_url;

		}else{
			
			if( !$(this).hasClass('opened')  ) openModalCart();			
			else                               closeModalCart();	

		}
		
	});
	
	if( wc_timeline.is_cart_page )
	{	
		setTimeout( () => $( document.body ).trigger( 'wc_fragment_refresh' ), 100 )
	}
	
	if( wc_timeline.has_carousel )
	{				
			preSetCarousel()		
			
			$(document).on('click touch','.wc-j-bullet', function(){

					carouselIndex = parseInt( $(this).attr('data-index') )
					shiftCarouselTo( carouselIndex, carouselItems )
					offsetPosition			= 0	

			});
			
			$(document).on('click touch','.wc-nav-prev', function(){

				if( carouselIndex == 0 ) return 

				carouselIndex--
				offsetPosition			= 0	
				shiftCarouselTo( carouselIndex, carouselItems )

			});

			$(document).on('click touch','.wc-nav-next', function(){

				if( carouselIndex >= carouselItems ) return 
				
				carouselIndex++
				offsetPosition			= 0	
				
				shiftCarouselTo( carouselIndex, carouselItems )

			});
		
			$(document.body).on('touchstart mousedown','.wc-j-items-carousel-inner', dragStart )
			$(document.body).on('touchend','.wc-j-items-carousel-inner', dragEnd )
			$(document.body).on('touchmove','.wc-j-items-carousel-inner', dragAction )

			function dragStart (e) {
				
				e = e || window.event;
				//e.preventDefault();		
				
				$('.wc-j-items-carousel-inner').css('transition','unset')
				
				if (e.type == 'touchstart') {

					whereTouchStart = e.touches[0].clientX;

				} else {
					
					whereTouchStart 		= e.clientX;
					document.onmouseup 		= dragEnd;
					document.onmousemove 	= dragAction;

				}			
				
			}
			
			function dragAction (e) 
			{

				e = e || window.event;
    
				if (e.type == 'touchmove')  offsetPosition = - ( whereTouchStart -  e.touches[0].clientX ) 					
				else 						offsetPosition = - ( whereTouchStart - e.clientX )
				
				$('.wc-j-items-carousel-inner').css({transform: "translate3d( -"+( posInitial - offsetPosition )+"px, 0, 0)"})			
			
			}
			  
			function dragEnd (e) {
				
				posFinal = posInitial - offsetPosition

				if ( posFinal - posInitial < -threshold ) 	carouselIndex--					
				else if (posFinal - posInitial > threshold) carouselIndex++				
				
				$('.wc-j-items-carousel-inner').css('transition','400ms ease all')
			
				shiftCarouselTo( carouselIndex, carouselItems )
			
				document.onmouseup 		= null;
				document.onmousemove 	= null;	
				offsetPosition			= 0		

			}
	}
	
	$('.wc-timeline-container-close-icon').on('click', function(){
		closeModalCart();
	});		
	
	$('.wc-timeline-modal-cover-container').on('swiperight', function(){
		closeModalCart();
	});	

	$(document).on('click touch', '.wc-timeline-qty', function() {
			
			$('.wc-timeline-product .out-of-stock').fadeOut(1);

            let $qty 	= $(this).parent().find('.btn-qty'),
                qtyVal = parseFloat( $qty.val() ),
                max 	= parseFloat($qty.attr('max')),
                min 	= parseFloat($qty.attr('min')),
                step 	= $qty.attr('step');
           
			if (!qtyVal || qtyVal === '' || qtyVal === 'NaN') 
			{
              	qtyVal = 0;
            }

			if (max === '' || max === 'NaN' || max === -1) 
			{
              	max = '';
            }

			if (min === '' || min === 'NaN') 
			{
              	min = 0;
            }

			if (step === 'any' || step === '' || step === undefined || parseFloat( step ) === 'NaN') 
			{
              	step = 1;
            }else{
              	step = parseFloat(step);
            }

			if ($(this).is('.quantity-up')) 
			{

				if(max && ( max == qtyVal || qtyVal > max )) 
				{
						$qty.val( max );						
						$(this).closest('.wc-timeline-product').find('.out-of-stock').fadeIn(100);
						return;

				}else{

					$qty.val( parseInt(qtyVal + step) );

				}
			  
            }else{
				if (min && ( min == qtyVal || qtyVal < min )) 
				{
						$qty.val(min);
				}else if (qtyVal > 0) 
				{
						$qty.val( parseInt(qtyVal - step) );				
				}
			}
			           
            $qty.trigger('change-qty');

	});
	
	$(document).on('change-qty', 'input.btn-qty', function() {

			const item 	   	= $( this ).closest('.wc-timeline-product'),
			 	  itemKey   = $( this ).attr('data-sku'),
			 	  itemQty   = $( this ).val();

			item.find('.loader').css('display', 'block' );
			$('.wc-timeline-action').prop('disabled', true );

			if( itemQty > 0 )
			{
					let updated = updateItemQty( itemKey, itemQty );

					updated.done( response  => {							
							
							item.find('.qty').text( itemQty );		
							
							$( document.body ).trigger( 'wc_fragment_refresh' );
							refreshCheckoutPage();
		
					});

			}else{

					let deleted = removeItem( itemKey );

					deleted.done( response  => {	
		
							$( document.body ).trigger( 'wc_fragment_refresh' );
							refreshCheckoutPage();								
	
					});
			}

	});

	$(document).on('click', '.wc-timeline-remove', function() {

			const item 		= $(this).closest('.wc-timeline-product'),
				  item_key 	= item.attr('data-key'),
				  deleted 	= removeItem( item_key )

			item.find('.loader').css('display', 'block' )
			$('.wc-timeline-action').prop('disabled', true )
			$('.wc-timeline-product .out-of-stock').fadeOut(1)		

			deleted.done( response  => {	
		
					$( document.body ).trigger( 'wc_fragment_refresh' )

					refreshCheckoutPage()				

			});
	});

	$(document).on('click', '.coupon_button', function() {

			const coupon_code 		= $('input[name="coupon_code"]').val()
			
			if( coupon_code.length < 3 ) return 		
			
			$(this).addClass('loading')

			applied 			= applyCoupon( coupon_code )

			applied.done( response  => {	

					manageNotifications( response )
					$('input[name="coupon_code"]').val('')

					if( response.notification && response.type == 'error' )
					{
						$(this).removeClass('loading')	
						return
					}
					
					$( document.body ).trigger( 'wc_fragment_refresh' )												

			})

	})

	$(document).on('click', '.remove-coupon', function() {

			const coupon_code 		= $(this).attr('data-code')			
			
			removed 			= removeCoupon( coupon_code )

			removed.done( response  => {	
					
					manageNotifications( response )

					if( response.notification && response.type == 'error' )
					{
						$(this).removeClass('loading')	
						return
					}
					
					$( document.body ).trigger( 'wc_fragment_refresh' )												

			})

	})

	$(document).on('click', '.wc-timeline-product .ajax_add_to_cart', function() {

			$('.wc-timeline-action').prop('disabled', true )
			$('.wc-timeline-product .out-of-stock').fadeOut(1)
			$(this).closest('.wc-timeline-product').find('.loader').css('display', 'block' )

	});
	
	reloadShippingBar()	

	// If variable set to 1, auto open the modal on product add
	// If we are on checkout, do not open the modal since it's not rendered
	$(document.body).on('added_to_cart', function( event, fragments, hash ) {

		
		if ( wc_timeline.open_on_add && !$( '.woocommerce-checkout' ).length && window.location.href.indexOf('elementor-preview')== -1  ) {

			setTimeout( () => { openModalCart(); }, 100)

		}
		
		refreshCheckoutPage()			

	});

	function updateItemQty( key, qty )
	{	
			
			return jQuery.ajax({								
				url: wc_timeline.url,
				method:'post',
				dataType:"json",		
				data: { action:'wc_timeline_update_qty', key:key, qty:qty },
				
			});

	}

	function applyCoupon( coupon )
	{	
			
			return jQuery.ajax({								
				url: wc_timeline.url,
				method:'post',
				dataType:"json",		
				data: { action:'wc_timeline_apply_coupon', coupon:coupon },
				
			});

	}

	function removeCoupon( coupon )
	{	
			
			return jQuery.ajax({								
				url: wc_timeline.url,
				method:'post',
				dataType:"json",		
				data: { action:'wc_timeline_remove_coupon', coupon:coupon },
				
			});

	}

	function removeItem( key )
	{	
			
			return jQuery.ajax({								
				url: wc_timeline.url,
				method:'post',
				dataType:"json",		
				data: { action:'wc_timeline_remove_item', key:key },
				
			});

	}	

	function manageNotifications( payload )
	{
		if( !payload.notification ) return 

		const target = $('.wc-timeline-notifications')
		
		target.fadeOut( 1 )
		target.html( payload.message )
		target.attr('data-type', payload.type )
		target.fadeIn()

		setTimeout( () => target.fadeOut( 500 ), modalNoticesTimeout )	

	}
	
	$(document.body).on('wc_fragments_refreshed', function() {

			reloadShippingBar()
			$('.wc-timeline-action').prop('disabled', false )
			$('.wc-timeline-product .loader').css('display', 'none' )
			
			adjustElementor()
			preSetCarousel()
			
	});

	$(document.body).on('wc_fragments_loaded', function() {

			reloadShippingBar()
			$('.wc-timeline-action').prop('disabled', false )
			$('.wc-timeline-product .loader').css('display', 'none' )
			
			adjustElementor()
			preSetCarousel()
			
	});	

	$(document.body).on('updated_checkout', function() {
				
			preSetCarousel()
			
	});	
	
});

})( jQuery );	